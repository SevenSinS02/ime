// import React, { Component } from 'react';
// import './style.css';
// import styles from './style.css';

// var settings = {
//   dots: false,
//   infinite: true,
//   fade: true,
//   autoplay: true,
//   speed: 500,
//   autoplaySpeed: 5000,
//   cssEase: 'linear',
//   slidesToScroll: 1
// };

// class Comments extends Component {
//   state = {};

//   render() {
//     const { comments } = this.props;
//     return (
//       <div className={styles.sliderContainer}>
//         <h1 className={`ui center aligned header ${styles.commentHeader}`}>
//           What others had to SAY?
//         </h1>
//         <Slider {...settings}>
//           {comments.map(c => (
//             <div>
//               <h3
//                 style={{
//                   display: '-webkit-box',
//                   maxWidth: '100%',
//                   lineHeight: 1,
//                   WebkitLineClamp: 2,
//                   WebkitBoxOrient: 'vertical',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis'
//                 }}
//               >
//                 {c.comment}
//               </h3>
//               <p className={styles.commentor}>- {c.name}</p>
//             </div>
//           ))}
//         </Slider>
//       </div>
//     );
//   }
// }

// export default Comments;
