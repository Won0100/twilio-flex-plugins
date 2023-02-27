const cAccent = 'HSL(144, 65%, 47%)';
const cAccentLight = 'HSL(144, 65%, 92%)'; // lighter version of cAccent
const cSolitude = 'HSL(230, 16%, 93%)';
const lightTheme = true;

export default {
  light: lightTheme,
  baseName: 'GreyLight',

  // base theme colors
  colors: {
    tabSelectedColor: cAccent,
    focusColor: cAccent,
    completeTaskColor: cAccent,
    defaultButtonColor: cAccent,
    flexBlueColor: cAccent
  },

  // component overrides
  overrides: {
    // top header
    MainHeader: {
      Container: {
        background: cAccent,
        color: cSolitude
      }
    },

    // left sidebar
    SideNav: {
      Container: {
        background: cSolitude,
        color: cAccent
      },
      Button: {
        background: cSolitude,
        color: cAccent,
        lightHover: !lightTheme
      },
      Icon: {
        color: cAccent
      }
    },

    // admin plugin
    FlexAdmin: {
      DashboardCard: {
        Icon: {
          backgroundColor: cAccentLight
        }
      }
    }
  }
};
