import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather, Entypo, Ionicons } from '@expo/vector-icons';
import { PeriodoProvider } from './PeriodoContext';
import { barsAnimation } from './hooks/barsAnimation';

import Inicio from './Inicio';
import Plano from './Plano';
import Relatorio from './Relatorio';
import Registro from './Registro';
import Agenda from './Agenda';
import Anotacao from './Anotacao';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {

    const deslocamentoBarra = barsAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 80],
    });

    const opacidadeBorda = barsAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    return (
        <Tab.Navigator

            initialRouteName='Inicio'

            screenOptions={({ navigation }) => ({
                headerShown: false,
                headerShadowVisible: false,
                headerTransparent: true,
                sceneContainerStyle: {
                    backgroundColor: 'white',
                },

                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray',
                tabBarHideOnKeyboard: true,

                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 65,
                    paddingBottom: 5,
                    paddingTop: 5,
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    borderTopColor: '#E0E0E0',
                    transform: [
                        { translateY: deslocamentoBarra }
                    ],
                    opacity: opacidadeBorda,
                },
            })}
        >
            <Tab.Screen
                name="Registro"
                component={Registro}
                options={{
                    tabBarLabel: 'Registro',
                    tabBarIcon: ({ focused, size }) => {
                        return (
                            <View
                                style={{
                                    width: 25,
                                    height: 25,
                                    borderRadius: 50,
                                    backgroundColor: focused ? 'black' : 'white',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: -2,
                                    marginLeft: -2,
                                }}
                            >
                                <Ionicons
                                    name='add'
                                    size={20}
                                    color={focused ? 'white' : 'black'}
                                />
                            </View>
                        );
                    }
                }}
            />

            <Tab.Screen
                name="Inicio"
                component={Inicio}
                options={{
                    tabBarLabel: 'Início',
                    tabBarIcon: ({ focused, size }) => (
                        <Ionicons
                            name='home'
                            size={24}
                            color={focused ? '#000' : '#888'}

                        />
                    )
                }}
            />

            <Tab.Screen
                name="Relatorio"
                component={Relatorio}
                options={{
                    tabBarLabel: 'Relatório',
                    tabBarIcon: ({ color, size }) => {
                        return <Entypo name="circular-graph" size={20} color={color} />
                    }
                }}
            ></Tab.Screen>
        </Tab.Navigator>
    )
}

export default function Routes() {
    return (
        <PeriodoProvider>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="Tabs"
                    component={Tabs}
                />
            </Stack.Navigator>
        </PeriodoProvider>
    );
}

