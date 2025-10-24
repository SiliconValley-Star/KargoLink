declare module 'react-native-vector-icons/MaterialIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  const MaterialIcons: typeof Icon;
  export default MaterialIcons;
}

declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL?: string;
    [name: string]: string | undefined;
  }
  const Config: NativeConfig;
  export default Config;
}

declare module '@react-native-async-storage/async-storage' {
  class AsyncStorage {
    static getItem(key: string): Promise<string | null>;
    static setItem(key: string, value: string): Promise<void>;
    static removeItem(key: string): Promise<void>;
    static multiGet(keys: string[]): Promise<[string, string | null][]>;
    static multiSet(keyValuePairs: [string, string][]): Promise<void>;
    static multiRemove(keys: string[]): Promise<void>;
    static getAllKeys(): Promise<string[]>;
    static clear(): Promise<void>;
  }
  export default AsyncStorage;
}

declare module '@react-navigation/native' {
  import { ComponentType } from 'react';
  
  export interface NavigationContainerProps {
    children: React.ReactNode;
    theme?: any;
  }
  
  export interface NavigationProp<ParamList = Record<string, object | undefined>> {
    navigate<RouteName extends keyof ParamList>(
      ...args: ParamList[RouteName] extends undefined
        ? [screen: RouteName] | [screen: RouteName, params: ParamList[RouteName]]
        : [screen: RouteName, params: ParamList[RouteName]]
    ): void;
    goBack(): void;
    canGoBack(): boolean;
    getId(): string | undefined;
    getParent<T = NavigationProp>(id?: string): T | undefined;
    getState(): any;
  }
  
  export function useNavigation<T = NavigationProp>(): T;
  export const NavigationContainer: React.FC<NavigationContainerProps>;
}

declare module '@react-navigation/native-stack' {
  export function createNativeStackNavigator<T = {}>(): any;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator<T = {}>(): any;
}