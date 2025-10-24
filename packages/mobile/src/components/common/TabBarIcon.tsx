import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TabBarIconProps {
  route: any;
  focused: boolean;
  color: string;
  size?: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({
  route,
  focused,
  color,
  size = 24,
}) => {
  let iconName = '';

  switch (route.name) {
    case 'Home':
      iconName = focused ? 'home' : 'home';
      break;
    case 'Shipments':
      iconName = focused ? 'local-shipping' : 'local-shipping';
      break;
    case 'Track':
      iconName = focused ? 'track-changes' : 'track-changes';
      break;
    case 'Profile':
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'help';
      break;
  }

  return (
    <View style={styles.container}>
      <Icon 
        name={iconName} 
        size={size} 
        color={color} 
        style={[
          styles.icon,
          focused && styles.focused,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  icon: {
    textAlign: 'center',
  },
  focused: {
    opacity: 1,
  },
});

export default TabBarIcon;