/**
 * Created by james on 23/02/2017.
 */

var extend = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i]) continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) out[key] = arguments[i][key];
    }
  }

  return out;
};
let count = 0;
var DraggablePiechart = function(setup) {
  var piechart = this;

  setup = extend({}, this.defaults, setup);

  this.canvas = setup.canvas;
  this.context = setup.canvas.getContext('2d');

  if (!this.context) {
    console.log('Error: DraggablePiechart needs an html5 canvas.');
    return;
  }

  if (setup.proportions) {
    this.data = generateDataFromProportions(setup.proportions);
  } else if (setup.data) {
    this.data = setup.data;
  }

  this.draggedPie = null;
  this.hoveredIndex = -1;
  this.nodes = {};
  this.radius = setup.radius;
  this.collapsing = setup.collapsing;
  this.minAngle = setup.minAngle;
  this.drawSegment = setup.drawSegment;
  this.drawNode = setup.drawNode;
  this.onchange = setup.onchange;

  // Bind appropriate events
  if (is_touch_device()) {
    this.canvas.addEventListener('touchstart', touchStart);
    this.canvas.addEventListener('touchmove', touchMove);
    document.addEventListener('touchend', touchEnd);
  } else {
    this.canvas.addEventListener('mousedown', touchStart);
    this.canvas.addEventListener('mousemove', touchMove);
    document.addEventListener('mouseup', touchEnd);
  }

  this.draw();

  function touchStart(event) {
    piechart.draggedPie = piechart.getTarget(getMouseLocation(event));
    if (piechart.draggedPie) {
      piechart.hoveredIndex = piechart.draggedPie.index;
      var i = piechart.hoveredIndex;
      var node = presentNode(piechart.nodes, i);
      console.log('nodes', piechart.nodes, i);

      console.log('next', piechart);
    }
  }

  function touchEnd() {
    if (piechart.draggedPie) {
      piechart.draggedPie = null;
      piechart.draw();
    }
  }

  function touchMove(event) {
    var dragLocation = getMouseLocation(event);

    if (!piechart.draggedPie) {
      var hoveredTarget = piechart.getTarget(dragLocation);
      if (hoveredTarget) {
        piechart.hoveredIndex = hoveredTarget.index;
        piechart.draw();
      } else if (piechart.hoveredIndex != -1) {
        piechart.hoveredIndex = -1;
        piechart.draw();
      }
      return;
    }

    var draggedPie = piechart.draggedPie;
    //console.log('asd move', draggedPie.index);
    var dx = dragLocation.x - draggedPie.centerX;
    var dy = dragLocation.y - draggedPie.centerY;

    // Get angle of grabbed target from centre of pie
    var newAngle = Math.atan2(dy, dx) - draggedPie.angleOffset;

    piechart.shiftSelectedAngle(newAngle);
    piechart.draw();
  }

  function getMouseLocation(evt) {
    var rect = piechart.canvas.getBoundingClientRect();

    if (evt.clientX) {
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    } else {
      return {
        x: evt.targetTouches[0].clientX - rect.left,
        y: evt.targetTouches[0].clientY - rect.top
      };
    }
  }

  /*
   * Generates angle data from proportions (array of objects with proportion, format
   */
  function generateDataFromProportions(proportions) {
    // sum of proportions
    var total = proportions.reduce(function(a, v) {
      return a + v.proportion;
    }, 0);

    // begin at 0
    var currentAngle = 0;

    // use the proportions to reconstruct angles
    return proportions.map(function(v, i) {
      var arcSize = (TAU * v.proportion) / total;
      var data = {
        angle: currentAngle,
        format: v.format,
        collapsed: arcSize <= 0
      };
      currentAngle = normaliseAngle(currentAngle + arcSize);
      return data;
    });
  }
};

/*
 * Move angle specified by index: i, by amount: angle in rads
 */
DraggablePiechart.prototype.moveAngle = function(i, amount) {
  if (this.data[i].collapsed && amount < 0) {
    this.setCollapsed(i, false);
    return;
  }

  var geometry = this.getGeometry();
  this.draggedPie = {
    index: i,
    angleOffset: 0,
    centerX: geometry.centerX,
    centerY: geometry.centerY,
    startingAngles: this.data.map(function(v) {
      return v.angle;
    }),
    collapsed: this.data.map(function(v) {
      return v.collapsed;
    }),
    angleDragDistance: 0
  };

  this.shiftSelectedAngle(this.data[i].angle + amount);
  this.draggedPie = null;
  this.draw();
};

/*
 * Gets percentage of indexed slice
 */
DraggablePiechart.prototype.getSliceSizePercentage = function(index) {
  var visibleSegments = this.getVisibleSegments();

  for (var i = 0; i < visibleSegments.length; i += 1) {
    if (visibleSegments[i].index == index) {
      return (100 * visibleSegments[i].arcSize) / TAU;
    }
  }
  return 0;
};

/*
 * Gets all percentages for each slice
 */
DraggablePiechart.prototype.getAllSliceSizePercentages = function() {
  var visibleSegments = this.getVisibleSegments();
  var percentages = [];
  for (var i = 0; i < this.data.length; i += 1) {
    const node = presentNode(this.nodes, i);
    if (this.data[i].collapsed || node) {
      percentages[i] = 0;
    } else {
      for (var j = 0; j < visibleSegments.length; j += 1) {
        if (visibleSegments[j].index == i) {
          percentages[i] = (100 * visibleSegments[j].arcSize) / TAU;
        }
      }
    }
  }

  return percentages;
};

/*
 * Gets the geometry of the pie chart in the canvas
 */
DraggablePiechart.prototype.getGeometry = function() {
  var centerX = Math.floor(this.canvas.width / 2);
  var centerY = Math.floor(this.canvas.height / 2);
  return {
    centerX: centerX,
    centerY: centerY,
    radius: 200
  };
};

/*
 * Returns a segment to drag if given a close enough location
 */
DraggablePiechart.prototype.getTarget = function(targetLocation) {
  var geometry = this.getGeometry();
  var startingAngles = [];
  var collapsed = [];

  var closest = {
    index: -1,
    distance: 9999999,
    angle: null
  };

  for (var i = 0; i < this.data.length; i += 1) {
    startingAngles.push(this.data[i].angle);
    collapsed.push(this.data[i].collapsed);

    // if (this.data[i].collapsed) {
    //   continue;
    // }

    var dx = targetLocation.x - geometry.centerX;
    var dy = targetLocation.y - geometry.centerY;
    var trueGrabbedAngle = Math.atan2(dy, dx);
    const node = presentNode(this.nodes, i);
    var offset = geometry.radius + (this.canvas.width / 2 - geometry.radius);
    var loc = node
      ? polarToCartesian(
          this.data[node.node].angle,
          geometry.radius + (node.index + 1) * 30
        )
      : polarToCartesian(this.data[i].angle, geometry.radius);
    var location = {
      x: loc.x + offset,
      y: loc.y + offset
    };
    let distance;
    if (location.x > targetLocation.x && location.y > targetLocation.y) {
      let a = location.x - targetLocation.x;
      let b = location.y - targetLocation.y;

      distance = Math.sqrt(a * a + b * b);
    } else if (location.x > targetLocation.x && location.y < targetLocation.y) {
      let a = location.x - targetLocation.x;
      let b = targetLocation.y - location.y;
      distance = Math.sqrt(a * a + b * b);
    } else if (location.x < targetLocation.x && location.y < targetLocation.y) {
      let a = targetLocation.x - location.x;
      let b = targetLocation.y - location.y;
      distance = Math.sqrt(a * a + b * b);
    } else if (location.x < targetLocation.x && location.y > targetLocation.y) {
      let a = targetLocation.x - location.x;
      let b = location.y - targetLocation.y;
      distance = Math.sqrt(a * a + b * b);
    }

    if (distance < closest.distance) {
      closest.index = i;
      closest.distance = distance;
      closest.angle = trueGrabbedAngle;
    }
  }

  if (closest.distance < 15) {
    return {
      index: closest.index,
      angleOffset: smallestSignedAngleBetween(
        closest.angle,
        startingAngles[closest.index]
      ),
      centerX: geometry.centerX,
      centerY: geometry.centerY,
      startingAngles: startingAngles,
      collapsed: collapsed,
      angleDragDistance: 0
    };
  } else {
    return null;
  }
};

/*
 * Sets segments collapsed or uncollapsed
 */
DraggablePiechart.prototype.setCollapsed = function(index, collapsed) {
  // Flag to set position of previously collapsed to new location
  var setNewPos = this.data[index].collapsed && !collapsed;
  var node = presentNode(this.nodes, index);
  console.log('move4 absent', this, node, this.nodes, index);
  if (node) {
    this.nodes[node.node].splice(node.index, 1);
    if (!this.nodes[node.node].length) delete this.nodes[node.node];
  }
  this.data[index].collapsed = collapsed;

  var visibleSegments = this.getVisibleSegments();

  // Shift other segments along to make space if necessary
  for (var i = 0; i < visibleSegments.length; i += 1) {
    // Start at this segment
    if (visibleSegments[i].index == index) {
      //Set new position
      if (setNewPos) {
        var nextSegment = visibleSegments[mod(i + 1, visibleSegments.length)];
        this.data[index].angle = nextSegment.angle - this.minAngle;
      }

      for (var j = 0; j < visibleSegments.length - 1; j += 1) {
        var currentSegment =
          visibleSegments[mod(1 + i - j, visibleSegments.length)];
        var nextAlongSegment =
          visibleSegments[mod(i - j, visibleSegments.length)];

        var angleBetween = Math.abs(
          smallestSignedAngleBetween(
            this.data[currentSegment.index].angle,
            this.data[nextAlongSegment.index].angle
          )
        );

        if (angleBetween < this.minAngle) {
          this.data[nextAlongSegment.index].angle = normaliseAngle(
            this.data[currentSegment.index].angle - this.minAngle
          );
        }
      }
      break;
    }
  }

  this.draw();
};

/*
 * Returns visible segments
 */
DraggablePiechart.prototype.getVisibleSegments = function() {
  var piechart = this;
  // Collect data for visible segments
  var visibleSegments = [];
  for (var i = 0; i < piechart.data.length; i += 1) {
    const node = presentNode(piechart.nodes, i);
    if (!piechart.data[i].collapsed || !node) {
      var startingAngle = piechart.data[i].angle;

      // Get arcSize
      var foundNextAngle = false;
      for (var j = 1; j < piechart.data.length; j += 1) {
        var nextAngleIndex = (i + j) % piechart.data.length;
        //console.log('next Angle Index', i, j, nextAngleIndex);
        const node = presentNode(piechart.nodes, nextAngleIndex);
        if (!piechart.data[nextAngleIndex].collapsed || !node) {
          var arcSize = piechart.data[nextAngleIndex].angle - startingAngle;
          //  console.log('arc size', arcSize);

          if (arcSize < 0) {
            arcSize += TAU;
          }

          visibleSegments.push({
            arcSize: arcSize,
            angle: startingAngle,
            format: piechart.data[i].format,
            index: i
          });

          foundNextAngle = true;
          break;
        }
      }

      // Only one segment
      if (!foundNextAngle) {
        visibleSegments.push({
          arcSize: TAU,
          angle: startingAngle,
          format: piechart.data[i].format,
          index: i
        });
        break;
      }
    }
  }
  return visibleSegments;
};

/*
 * Returns invisible segments
 */
DraggablePiechart.prototype.getInvisibleSegments = function() {
  var piechart = this;
  // Collect data for visible segments
  var invisibleSegments = [];
  for (var i = 0; i < piechart.data.length; i += 1) {
    const node = presentNode(piechart.nodes, i);

    if (piechart.data[i].collapsed || node) {
      invisibleSegments.push({
        index: i,
        format: piechart.data[i].format
      });
    }
  }

  return invisibleSegments;
};

/*
 * Draws the piechart
 */
DraggablePiechart.prototype.draw = function() {
  var piechart = this;
  var context = piechart.context;
  var canvas = piechart.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);

  var geometry = this.getGeometry();

  var visibleSegments = this.getVisibleSegments();

  // Flags to get arc sizes and index of largest arc, for drawing order
  var largestArcSize = 0;
  var indexLargestArcSize = -1;

  // Get the largeset arcsize
  for (var i = 0; i < visibleSegments.length; i += 1) {
    if (visibleSegments[i].arcSize > largestArcSize) {
      largestArcSize = visibleSegments[i].arcSize;
      indexLargestArcSize = i;
    }
  }

  // Need to draw in correct order
  for (i = 0; i < visibleSegments.length; i += 1) {
    // Start with one *after* largest
    var index = mod(i + indexLargestArcSize + 1, visibleSegments.length);
    piechart.drawSegment(
      context,
      piechart,
      geometry.centerX,
      geometry.centerY,
      geometry.radius,
      visibleSegments[index].angle,
      visibleSegments[index].arcSize,
      visibleSegments[index].format,
      false,
      visibleSegments[index].index
    );
  }

  // Now draw invisible segments
  var invisibleSegments = this.getInvisibleSegments();

  for (i = 0; i < invisibleSegments.length; i += 1) {
    piechart.drawSegment(
      context,
      piechart,
      geometry.centerX,
      geometry.centerY,
      geometry.radius,
      0,
      0,
      invisibleSegments[i].format,
      true
    );
  }

  // Finally draw drag nodes on top (order not important)
  for (i = 0; i < piechart.data.length; i += 1) {
    var node = presentNode(piechart.nodes, i);

    let location;
    if (node) {
      //update here for correct angle updates
      const angle = piechart.data[node.node].angle;
      location = polarToCartesian(
        angle,
        geometry.radius + (node.index + 1) * 30
      );
    } else {
      location = polarToCartesian(piechart.data[i].angle, geometry.radius);
    }
    piechart.drawNode(
      context,
      piechart,
      location.x,
      location.y,
      geometry.centerX,
      geometry.centerY,
      i == piechart.hoveredIndex,
      i
    );
  }

  //draw labels
  for (i = 0; i < piechart.data.length; i += 1) {
    var node = presentNode(piechart.nodes, i);

    let location;
    if (node) {
      //update here for correct angle updates
      const angle = piechart.data[node.node].angle;
      location = polarToCartesian(
        angle,
        geometry.radius + (node.index + 1.5) * 30
      );
    } else {
      location = polarToCartesian(piechart.data[i].angle, geometry.radius + 30);
    }
  }

  piechart.onchange(piechart);
};

function presentNode(nodeObj, index) {
  let status = false;
  index = parseInt(index, 10);
  for (let node in nodeObj) {
    let i = nodeObj[node].indexOf(index);
    if (i > -1) {
      status = { node, index: i };
      return status;
    }
  }

  return status;
}

/*
 * *INTERNAL USE ONLY*
 * Moves the selected angle to a new angle
 */
DraggablePiechart.prototype.shiftSelectedAngle = function(newAngle) {
  var piechart = this;
  if (!piechart.draggedPie) {
    return;
  }
  var draggedPie = piechart.draggedPie;

  // Get starting angle of the target
  var startingAngle = draggedPie.startingAngles[draggedPie.index];

  // Get previous angle of the target
  var previousAngle = piechart.data[draggedPie.index].angle;

  // Get diff from grabbed target start (as -pi to +pi)
  var angleDragDistance = smallestSignedAngleBetween(newAngle, startingAngle);

  // Get previous diff
  var previousDragDistance = draggedPie.angleDragDistance;

  // Determines whether we go clockwise or anticlockwise
  var rotationDirection = previousDragDistance > 0 ? 1 : -1;

  //console.log('shift', rotationDirection, startingAngleToNonDragged);
  // Reverse the direction if we have done over 180 in either direction
  var sameDirection = previousDragDistance > 0 == angleDragDistance > 0;
  var greaterThanHalf =
    Math.abs(previousDragDistance - angleDragDistance) > Math.PI;

  if (greaterThanHalf && !sameDirection) {
    // Reverse the angle
    angleDragDistance = (TAU - Math.abs(angleDragDistance)) * rotationDirection;
    //console.log('ok false', angleDragDistance);
  } else {
    //console.log('ok true');
    rotationDirection = angleDragDistance > 0 ? 1 : -1;
  }

  draggedPie.angleDragDistance = angleDragDistance;

  // Set the new angle:
  piechart.data[draggedPie.index].angle = normaliseAngle(
    startingAngle + angleDragDistance
  );

  // Reset Collapse and nodes list of dragged node
  piechart.data[draggedPie.index].collapsed =
    draggedPie.collapsed[draggedPie.index];

  // console.log(
  //   'asd shift',
  //   draggedPie.index,
  //   piechart.data[draggedPie.index].collapsed,
  //   piechart.data[draggedPie.index].angle
  // );
  // Search other angles
  var shifting = true;
  var collapsed = false;
  var minAngle = piechart.minAngle;
  var numberOfAnglesShifted = 0;

  for (var i = 1; i < piechart.data.length; i += 1) {
    // Index to test each slice in order
    var index = mod(
      parseInt(draggedPie.index) + i * rotationDirection,
      piechart.data.length
    );

    // Get angle from target start to this angle
    var startingAngleToNonDragged = smallestSignedAngleBetween(
      draggedPie.startingAngles[index],
      startingAngle
    );
    //console.log('startingAngleToNonDragged', index, startingAngleToNonDragged, angleDragDistance);
    // If angle is in the wrong direction then it should actually be OVER 180
    if (startingAngleToNonDragged * rotationDirection < 0) {
      startingAngleToNonDragged =
        (startingAngleToNonDragged * rotationDirection + TAU) *
        rotationDirection;
    }

    if (piechart.collapsing) {
      // *Collapsing behaviour* when smallest angle encountered

      // Reset collapse
      piechart.data[index].collapsed = draggedPie.collapsed[index];
      const node = presentNode(piechart.nodes, index);

      var checkForSnap = !collapsed && !piechart.data[index].collapsed;
      // console.log(
      //   'snap',
      //   node,
      //   angleDragDistance,
      //   startingAngleToNonDragged,
      //   draggedPie.index,
      //   index
      // );
      // Snap node to collapse, and prevent going any further
      if (
        checkForSnap &&
        startingAngleToNonDragged >= 0 &&
        angleDragDistance > startingAngleToNonDragged - minAngle
      ) {
        piechart.data[draggedPie.index].angle = piechart.data[index].angle;
        //update all nodes if its a key node being dragged

        piechart.data[draggedPie.index].collapsed = true;
        collapsed = true;
        //if dragged node is present as a key in nodes
        const status = piechart.nodes[draggedPie.index] ? true : false;

        if (status) {
          //if destination node is a collapsed node
          if (node) {
            //add dragged nodes list to the next node nodes list
            piechart.nodes[node.node] = piechart.nodes[node.node]
              ? [
                  ...piechart.nodes[node.node],
                  draggedPie.index,
                  ...piechart.nodes[draggedPie.index]
                ]
              : [draggedPie.index, ...piechart.nodes[draggedPie.index]];
            piechart.nodes[node.node] = piechart.nodes[node.node].reduce(
              function(a, b) {
                if (a.indexOf(b) == -1) {
                  a.push(b);
                }
                return a;
              },
              []
            );
            delete piechart.nodes[draggedPie.index];
            console.log(
              'greater if status ',
              index,
              draggedPie.index,
              piechart.nodes[index],
              piechart.nodes[draggedPie.index],
              piechart
            );
          } else {
            //if destination node isnt a collapsed node
            console.log(
              'greater else status',
              index,
              draggedPie.index,
              piechart.nodes,
              piechart.nodes[draggedPie.index],
              piechart
            );
            piechart.nodes[index] = piechart.nodes[index]
              ? piechart.nodes[index]
              : [];
            piechart.nodes[index] = piechart.nodes[index]
              ? [
                  ...piechart.nodes[index],
                  draggedPie.index,
                  ...piechart.nodes[draggedPie.index]
                ]
              : [draggedPie.index, ...piechart.nodes[draggedPie.index]];
            piechart.nodes[index] = piechart.nodes[index].reduce(function(
              a,
              b
            ) {
              if (a.indexOf(b) == -1) {
                a.push(b);
              }
              return a;
            },
            []);
            if (piechart.nodes[draggedPie.index])
              delete piechart.nodes[draggedPie.index];
          }
        } else {
          console.log(
            'greater else not status',
            index,
            draggedPie.index,
            piechart.nodes,
            piechart.nodes[draggedPie.index],
            piechart
          );
          if (node) {
            piechart.nodes[node.node] =
              piechart.nodes[node.node].indexOf(draggedPie.index) == -1
                ? [...piechart.nodes[node.node], draggedPie.index]
                : piechart.nodes[node.node];
          } else {
            piechart.nodes[index] = piechart.nodes[index]
              ? piechart.nodes[index]
              : [];
            piechart.nodes[index] =
              piechart.nodes[index].indexOf(draggedPie.index) == -1
                ? [...piechart.nodes[index], draggedPie.index]
                : piechart.nodes[index];
          }
        }
      } else if (
        checkForSnap &&
        startingAngleToNonDragged < 0 &&
        angleDragDistance < startingAngleToNonDragged + minAngle
      ) {
        piechart.data[draggedPie.index].angle = piechart.data[index].angle;
        piechart.data[index].collapsed = true;
        collapsed = true;
        //initialize field in nodes object
        piechart.nodes[draggedPie.index] = piechart.nodes[draggedPie.index]
          ? piechart.nodes[draggedPie.index]
          : [];
        //check if collapsing node is already present
        const node = presentNode(piechart.nodes, index);
        //if not present then check if draged node is present as a key in nodes
        //if true: merge fields with collapsing nodes into an array and delete collapsing node key
        //if false: add collapsing node to dragged node list
        const status = piechart.nodes[index] ? true : false;
        if (status) {
          if (node) {
            piechart.nodes[node.node] = piechart.nodes[node.node]
              ? [...piechart.nodes[node.node], index, ...piechart.nodes[index]]
              : [index, ...piechart.nodes[index]];
            piechart.nodes[node.node] = piechart.nodes[node.node].reduce(
              function(a, b) {
                if (a.indexOf(b) == -1) {
                  a.push(b);
                }
                return a;
              },
              []
            );
            delete piechart.nodes[draggedPie.index];
            console.log(
              'lesser if status',
              index,
              draggedPie.index,
              piechart.nodes[index],
              piechart
            );
          } else {
            piechart.nodes[draggedPie.index] = piechart.nodes[draggedPie.index]
              ? piechart.nodes[draggedPie.index]
              : [];
            piechart.nodes[draggedPie.index] = piechart.nodes[draggedPie.index]
              ? [
                  ...piechart.nodes[draggedPie.index],
                  index,
                  ...piechart.nodes[index]
                ]
              : [draggedPie.draggedPie.index, ...piechart.nodes[index]];
            piechart.nodes[draggedPie.index] = piechart.nodes[
              draggedPie.index
            ].reduce(function(a, b) {
              if (a.indexOf(b) == -1) {
                a.push(b);
              }
              return a;
            }, []);
            if (piechart.nodes[index]) delete piechart.nodes[index];
            console.log(
              'lesser else status',
              index,
              draggedPie.index,
              piechart.nodes[draggedPie.index],
              piechart
            );
          }
        } else {
          if (node) {
            console.log('where');
            piechart.nodes[node.node] =
              piechart.nodes[node.node].indexOf(index) == -1
                ? [...piechart.nodes[node.node], index]
                : piechart.nodes[node.node];
            draggedPie.collapsed[index] = true;
          } else {
            console.log('wheres');
            piechart.nodes[draggedPie.index] = piechart.nodes[draggedPie.index]
              ? piechart.nodes[draggedPie.index]
              : [];
            piechart.nodes[draggedPie.index] =
              piechart.nodes[draggedPie.index].indexOf(index) == -1
                ? [...piechart.nodes[draggedPie.index], index]
                : piechart.nodes[draggedPie.index];
          }
          console.log(
            'lesser else not status',
            index,
            draggedPie.index,
            piechart.nodes[index],
            piechart
          );
        }
      } else {
        count += 1;
        //if dragged node is a key then update all nodes in list with same angle
        //otherwise if it is a collapsed node do nothing

        const nd = presentNode(piechart.nodes, draggedPie.index);
        if (
          startingAngleToNonDragged == 0 &&
          angleDragDistance < startingAngleToNonDragged - minAngle
        ) {
          draggedPie.collapsed[draggedPie.index] = false;
          piechart.data[draggedPie.index].collapsed = false;
          if (
            piechart.nodes[nd.node] &&
            piechart.nodes[nd.node].indexOf(draggedPie.index) > -1
          ) {
            const nodesRemoved = piechart.nodes[nd.node].splice(
              nd.index,
              piechart.nodes[nd.node].length - nd.index
            );
            if (nodesRemoved.length > 1) {
              piechart.nodes[nodesRemoved[0]] = nodesRemoved.slice(1);
            }
            console.log('removed', nodesRemoved);
          }
          if (piechart.nodes[nd.node] && !piechart.nodes[nd.node].length)
            delete piechart.nodes[nd.node];
          console.log(
            'greater collapsed',
            draggedPie.index,
            count,
            piechart.nodes,
            checkForSnap,
            piechart.data[draggedPie.index].collapsed,
            collapsed,
            startingAngleToNonDragged,
            angleDragDistance,
            piechart
          );
        }
        //when dragged node is moved to the dest node and back
        if (
          piechart.nodes[index] &&
          piechart.nodes[index].indexOf(draggedPie.index) > -1
        ) {
          console.log('drag node moved to dest node and back');
          const nodesRemoved = piechart.nodes[index].splice(
            nd.index,
            piechart.nodes[index].length - nd.index
          );
          if (nodesRemoved.length) {
            piechart.nodes[nodesRemoved[0]] = nodesRemoved.slice(1);
          }

          if (!piechart.nodes[index].length) delete piechart.nodes[index];
        }
        //nd is draggedPie,node is index
        if (
          nd &&
          startingAngleToNonDragged !== 0 &&
          piechart.nodes[draggedPie.index] &&
          piechart.nodes[draggedPie.index].indexOf(index) > -1
        ) {
          const nodesRemoved = piechart.nodes[draggedPie.index].splice(
            node.index,
            piechart.nodes[draggedPie.index].length - node.index
          );
          console.log('removed1', index, draggedPie.index, nodesRemoved);
          if (nodesRemoved.length) {
            piechart.nodes[nodesRemoved[0]] = nodesRemoved.slice(1);
          }
          if (!piechart.nodes[draggedPie.index].length)
            delete piechart.nodes[draggedPie.index];
        }

        piechart.data[index].angle = draggedPie.startingAngles[index];
        // console.log(
        //   'greater uncollapsed',
        //   draggedPie.index,
        //   index,
        //   startingAngleToNonDragged,
        //   angleDragDistance,
        //   piechart
        // );

        if (node) {
          console.log(
            'update all node',
            piechart.data[index].angle,
            draggedPie.startingAngles[index]
          );

          piechart.data[index].angle = piechart.data[node.node].angle;
        }
      }
    }

    //console.log(JSON.stringify(piechart.data));
  }
};
DraggablePiechart.prototype.defaults = {
  onchange: function(piechart) {},
  radius: 0.9,
  data: [
    {
      angle: -2,
      format: { color: '#2665da', label: 'Walking' },
      collapsed: false
    },
    {
      angle: -1,
      format: { color: '#6dd020', label: 'Programming' },
      collapsed: false
    },
    {
      angle: 0,
      format: { color: '#f9df18', label: 'Chess' },
      collapsed: false
    },
    {
      angle: 1,
      format: { color: '#d42a00', label: 'Eating' },
      collapsed: false
    },
    {
      angle: 2,
      format: { color: '#e96400', label: 'Sleeping' },
      collapsed: false
    }
  ],
  collapsing: false,
  minAngle: 0.1,

  drawSegment: function(
    context,
    piechart,
    centerX,
    centerY,
    radius,
    startingAngle,
    arcSize,
    format,
    collapsed,
    index
  ) {
    if (collapsed) {
      return;
    }

    // Draw coloured segment
    context.save();
    var endingAngle = startingAngle + arcSize;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
    context.closePath();

    context.fillStyle = format.color;
    context.fill();
    context.restore();

    //Draw label on top
    context.save();
    context.translate(centerX, centerY);
    context.rotate(startingAngle);
    context.fillStyle = '#fff';
    var fontSize = Math.floor(context.canvas.height / 50);
    var dx = radius - fontSize;
    var dy = centerY / 10;

    context.textAlign = 'right';
    context.font = fontSize + 'pt Helvetica';
    const percentage = piechart.getSliceSizePercentage(index);

    //console.log('percentage', index, percentage);
    context.fillText(percentage.toFixed(0) + '%', dx, dy);
    context.restore();
  },

  drawNode(context, piechart, x, y, centerX, centerY, hover, i) {
    context.save();
    context.translate(centerX, centerY);
    context.fillStyle = piechart.data[i].format.color;

    context.font = 'bold 24px myFirstFont';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    const rad = hover ? 20 : 15;
    context.beginPath();
    context.arc(x, y, rad, 0, TAU, true);
    context.fill();
    context.beginPath();
    context.fillStyle = 'white';
    context.fillText(i + 1, x, y);
    context.fill();
    context.stroke();
    context.restore();
  }
};

export default DraggablePiechart;

/*
 * Utilities + Constants
 */

var TAU = Math.PI * 2;

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function smallestSignedAngleBetween(target, source) {
  return Math.atan2(Math.sin(target - source), Math.cos(target - source));
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function is_touch_device() {
  return (
    'ontouchstart' in window || navigator.maxTouchPoints // works on most browsers
  ); // works on IE10/11 and Surface
}

function normaliseAngle(angle) {
  return mod(angle + Math.PI, TAU) - Math.PI;
}

function polarToCartesian(angle, radius) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  };
}
