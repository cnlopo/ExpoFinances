import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import { createBottomTabNavigator  } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather, Entypo, Ionicons } from '@expo/vector-icons';

import Inicio from './Inicio';
import Plano from './Plano';
import Relatorio from './Relatorio';
import Registro from './Registro';
import Agenda from './Agenda';
import Anotacao from './Anotacao';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
    return (
        <Tab.Navigator
            screenOptions={({ navigation }) => ({
                headerShadowVisible: true,

                headerTitle: () => (
                    <Text style={{
                        fontFamily: 'Inter_700Bold',    
                        fontSize: 24,
                    }}>ExpoFinances</Text>
                ),

                headerTitleAlign: 'center',

                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Inicio')}
                        style={{
                            marginLeft: 30,
                        }}
                    ><Entypo name="home" size={24}/>
                    </TouchableOpacity>
                ),

                headerStyle: {
                    height: 75,
                    backgroundColor: 'white',
                    borderBottomWidth: 2,
                    borderBottomColor: '#E0E0E0',
                },

                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray',
                tabBarHideOnKeyboard: true,

                tabBarStyle: {
                    height: 75,
                    paddingBottom: 10,
                    paddingTop: 10,
                    backgroundColor: 'white',
                    borderTopWidth: 2,
                    borderTopColor: '#E0E0E0',

                }
            })}
        >
            <Tab.Screen
                name="Inicio"
                component={Inicio}
                options={{
                    href: null,

                    tabBarItemStyle: {
                        display: 'none',
                    }
                }}
            />
            <Tab.Screen
            name="Registro"
            component={Registro}
            options={{
                tabBarLabel: 'Registro',
                tabBarLabelStyle: {
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                },
                tabBarIcon:({color, size}) => {
                return <Ionicons name="add-circle" size={size*1.2} color={'black'} style={{ marginTop: -2, marginLeft: -2,}}/>
                }
            }}
            ></Tab.Screen>
            <Tab.Screen
            name="Relatorio"
            component={Relatorio}
            options={{
                tabBarLabel: 'Relatório',
                tabBarLabelStyle: {
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                },
                tabBarIcon:({color, size}) => {
                return <Entypo name="circular-graph" size={size} color={color}/>
                }
            }}
            ></Tab.Screen>
        </Tab.Navigator>
    )
}

export default function Routes() {
    return (
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
    );
}

