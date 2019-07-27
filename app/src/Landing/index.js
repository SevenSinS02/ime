import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';

import styles from './style.css';
import logo from '../images/imelogo.png';
import wave from '../images/waveform.png';
import button from '../images/swipe-btn.png';

class Landing extends Component {
  render() {
    return (
      <Fragment>
        <div className={`ui image ${styles.logo}`}>
          <img className="ui small left floated image" src={logo} />
        </div>
        <div className={`ui fluid container ${styles.cont}`}>
          <div className="ui horizontally padded center aligned grid">
            <div className="sixteen wide column">
              <h1 className={styles.header}>HELLO</h1>
              <p className={styles.subheader}>
                We just required 2 minutes of your valuable time
              </p>
              <div className="ui image" style={{ marginBottom: '1em' }}>
                <img className="ui image" src={wave} />
              </div>
              <p className={styles.subheader}>
                <span className={styles.bold}>Please</span> give us your opinion
                on some <span className={styles.bold}>Ethical Questions</span>{' '}
                related to Music
              </p>
              <Link to="/survey" className="ui image">
                <img src={button} />
              </Link>
              <p className={styles.subheader}>Touch Here</p>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default Landing;
// render() {
//   return (
//     <div className="ui fluid container">
//       <div className="ui horizontally padded grid ">
//         <div className="sixteen wide column">
//           <div className={`ui very padded segment ${styles.topContainer}`}>
//             <div className="ui horizontally padded grid ">
//               <div className="row">
//                 <div className="eight wide column">
//                   <Text style={{ color: '#ffffff66', fontSize: '1.2rem' }} />
//                 </div>
//                 <div className="eight wide right aligned column">
//                   <Text
//                     style={{
//                       color: '#00000066',
//                       fontSize: '1.2rem',
//                       fontWeight: 600
//                     }}
//                   />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="eight wide column">
//                   <Text style={{ color: '#ffffff66' }} />
//                 </div>
//                 <div className="eight wide right aligned column">
//                   <Text style={{ color: '#ffffff66', fontSize: '1.4rem' }} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="eight wide column">
//                   <Text style={{ color: '#00000066', fontSize: '1.2rem' }} />
//                 </div>
//                 <div className="eight wide right aligned column">
//                   <Text style={{ color: '#00000066' }} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="sixteen wide column">
//           <div className={styles.midContainer}>
//             There are many questions surrounding ownership and copyright in
//             music. The answers to these questions are often not black and
//             white, and depend on the particular situation. Nevertherless, we
//             would love to hear your opinion and why you feel the way you do.
//             Also, do take a moment to discover what others think.
//           </div>
//         </div>
//         <div className="sixteen wide column">
//           <div
//             className={`ui very padded inverted orange segment ${
//               styles.botContainer
//             }`}
//             style={{ paddingTop: '5rem' }}
//           >
//             <div className={styles.proceedContainer}>
//               <Link to="/survey" className={styles.proceedButton}>
//                 Click here to Proceed
//               </Link>
//             </div>
//             <div className="ui horizontally padded grid ">
//               <div className="row">
//                 <div className="nine wide column">
//                   <Text style={{ color: '#ffffff66', fontSize: '1.6rem' }} />
//                 </div>
//                 <div className="seven wide right aligned column">
//                   <Text style={{ color: '#00000066', fontWeight: 600 }} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="eight wide column">
//                   <Text style={{ color: '#ffffff66' }} />
//                 </div>
//                 <div className="eight wide right aligned column">
//                   <Text style={{ color: '#ffffff66' }} />
//                 </div>
//               </div>
//               <div className="row">
//                 <div className="eight wide column">
//                   <Text
//                     style={{
//                       color: '#ffffff66',
//                       fontSize: '1.2rem',
//                       fontWeight: 600
//                     }}
//                   />
//                 </div>
//                 <div className="eight wide right aligned column">
//                   <Text style={{ color: '#00000066', fontSize: '1.4rem' }} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
