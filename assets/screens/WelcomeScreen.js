import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    console.log('WelcomeScreen mounted, setting up timer');
    
    const timer = setTimeout(() => {
      console.log('Timer expired, attempting to navigate to SignUpScreen');
      if (navigation) {
        navigation.navigate('SignUpScreen');
      } else {
        console.error('Navigation prop is undefined or null');
      }
    }, 3000);


    return () => {
      console.log('WelcomeScreen unmounting, clearing timer');
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* <svg width="311" height="308" viewBox="0 0 311 308" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_f_0_1)">
<ellipse cx="155.5" cy="154" rx="55.5" ry="54" fill="white"/>
</g>
<path fill-rule="evenodd" clip-rule="evenodd" d="M147.616 124.367C149.292 124.15 151.295 123.891 155.499 123.891C159.704 123.891 161.707 124.15 163.383 124.367C164.589 124.522 165.625 124.656 167.19 124.656C168.592 124.656 171.253 123.109 174.183 121.406C177.772 119.321 181.763 117.001 184.338 117.001C189.014 117.001 194.471 119.757 194.471 127.719V136.906C194.461 139.318 193.588 146.711 190.169 144.735C194.21 149.527 194.619 155.115 194.564 160.524C195.653 160.84 196.764 161.196 197.842 161.566C201.182 162.712 204.724 164.173 206.324 165.21C208.023 166.311 208.511 168.586 207.414 170.29C206.316 171.996 204.049 172.485 202.35 171.384C201.587 170.89 198.827 169.672 195.472 168.521C195.101 168.393 194.729 168.269 194.358 168.149C194.132 170.275 193.572 172.215 192.738 173.983L192.853 174.044C194.854 175.105 196.71 176.323 197.894 177.099C198.099 177.234 198.284 177.355 198.445 177.46C200.145 178.561 200.633 180.836 199.536 182.54C198.438 184.246 196.171 184.735 194.471 183.634C194.271 183.504 194.057 183.364 193.83 183.216L193.826 183.213C192.629 182.429 191.098 181.427 189.43 180.542C189.039 180.334 188.662 180.146 188.302 179.977C179.852 187.927 164.681 190.5 155.499 190.5C146.317 190.5 131.146 187.927 122.696 179.977C122.336 180.146 121.959 180.334 121.567 180.542C119.901 181.426 118.372 182.427 117.175 183.211L117.167 183.216C116.941 183.364 116.727 183.504 116.526 183.634C114.827 184.735 112.56 184.246 111.463 182.54C110.365 180.836 110.853 178.561 112.552 177.46C112.714 177.355 112.899 177.234 113.104 177.099L113.105 177.099C114.289 176.322 116.145 175.104 118.145 174.044L118.26 173.983C117.427 172.215 116.866 170.275 116.64 168.149C116.27 168.269 115.899 168.393 115.528 168.521C112.173 169.672 109.413 170.89 108.65 171.384C106.951 172.485 104.684 171.996 103.586 170.29C102.489 168.586 102.977 166.311 104.676 165.21C106.276 164.173 109.818 162.712 113.158 161.566C114.236 161.196 115.346 160.84 116.435 160.525C116.379 155.115 116.788 149.527 120.829 144.735C117.411 146.711 116.537 139.318 116.528 136.906V127.719C116.528 119.756 121.984 117 126.66 117C129.235 117 133.227 119.32 136.815 121.406C139.745 123.109 142.406 124.656 143.808 124.656C145.373 124.656 146.41 124.522 147.616 124.367Z" fill="white"/>
<defs>
<filter id="filter0_f_0_1" x="0" y="0" width="311" height="308" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="50" result="effect1_foregroundBlur_0_1"/>
</filter>
</defs>
</svg> */}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF3705',
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default WelcomeScreen;