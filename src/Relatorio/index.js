import { Dimensions, View, Text, StyleSheet, ScrollView } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useFocusEffect } from '@react-navigation/native';
import db from '../database/database';
import { useState, useCallback, useContext } from 'react';
import { PeriodoContext } from '../PeriodoContext';

const nomesMeses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

export default function Grafico() {

    const {
        mesSelecionado,
        anoSelecionado
    } = useContext(PeriodoContext);

    const nomeMes = nomesMeses[mesSelecionado];

    const [gastosFixos, setGastosFixos] = useState(0);
    const [gastosVariaveis, setGastosVariaveis] = useState(0);
    const [receitas, setReceitas] = useState(0);
    const [alimentacao, setAlimentacao] = useState(0);
    const [transporte, setTransporte] = useState(0);
    const [moradia, setMoradia] = useState(0);
    const [saude, setSaude] = useState(0);
    const [lazer, setLazer] = useState(0);
    const [outros, setOutros] = useState(0);

    function carregarDados() {

        const mesFormatado = String(mesSelecionado + 1).padStart(2, '0');
        const periodo = `${anoSelecionado}-${mesFormatado}`;

        const registros = db.getAllSync(
            `SELECT * FROM registros
            WHERE substr(data_registro, 1, 7) = ?`,
            periodo
        );

        const gastos = registros.filter(
            item =>
                item.tipo === 'fixo' ||
                item.tipo === 'variavel'
            );

        setAlimentacao(
            gastos
                .filter(item => item.categoria === 'Alimentação')
                .reduce((t, item) => t + item.valor, 0)
        );

        setTransporte(
            gastos
                .filter(item => item.categoria === 'Transporte')
                .reduce((t, item) => t + item.valor, 0)
        );

        setMoradia(
            gastos
                .filter(item => item.categoria === 'Moradia')
                .reduce((t, item) => t + item.valor, 0)
        );

        setSaude(
            gastos
                .filter(item => item.categoria === 'Saúde')
                .reduce((t, item) => t + item.valor, 0)
        );

        setLazer(
            gastos
                .filter(item => item.categoria === 'Lazer')
                .reduce((t, item) => t + item.valor, 0)
        );

        setOutros(
            gastos
                .filter(item => item.categoria === 'Outros')
                .reduce((t, item) => t + item.valor, 0)
        );

        const totalReceitas = registros
            .filter(item => item.tipo === 'receita')
            .reduce((total, item) => total + item.valor, 0);

        const totalFixos = registros
            .filter(item => item.tipo === 'fixo')
            .reduce((total, item) => total + item.valor, 0);

        const totalVariaveis = registros
            .filter(item => item.tipo === 'variavel')
            .reduce((total, item) => total + item.valor, 0);

        setReceitas(totalReceitas);
        setGastosFixos(totalFixos);
        setGastosVariaveis(totalVariaveis);
    }

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [mesSelecionado, anoSelecionado])
    );

    const datagrafico1 = [
        {
            name: "Fixas",
            population: gastosFixos || 1,
            color: "#ff0000",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
        {
            name: "Variáveis",
            population: gastosVariaveis || 1,
            color: "#0062ff",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
        {
            name: "Receitas",
            population: receitas || 1,
            color: "#ffe100",
            legendFontColor: "#666",
            legendFontSize: 13,
        }
    ];

    const datagrafico2 = [
        {
            name: "Alimentação",
            population: alimentacao || 1,
            color: "#6C63FF",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
        {
            name: "Transporte",
            population: transporte || 1,
            color: "#4CAF50",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
        {
            name: "Moradia",
            population: moradia || 1,
            color: "#FF9800",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
        {
            name: "Saúde",
            population: saude || 1,
            color: "#F44336",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
        {
            name: "Lazer",
            population: lazer || 1,
            color: "#00BCD4",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
        {
            name: "Outros",
            population: outros || 1,
            color: "#9C27B0",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
    ];

    const datagrafico3 = [
        {
            name: "Entradas",
            valor: receitas || 1,
            color: "#4CAF50",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
        {
            name: "Saídas",
            valor: (gastosFixos + gastosVariaveis) || 1,
            color: "#F44336",
            legendFontColor: "#666",
            legendFontSize: 13,
        },
    ];

    return (
        <ScrollView>
            <View style={styles.container}>

                <View style={styles.cabecalhoRelatorio}>
                    <Text style={styles.tituloRelatorio}>
                        Relatório Financeiro
                    </Text>

                    <Text style={styles.subtituloRelatorio}>
                        {nomeMes} de {anoSelecionado}
                    </Text>
                </View>


                <View style={styles.card}>
                    <Text style={styles.titulo}>Distribuição da Renda</Text>

                    <PieChart
                        data={datagrafico1}
                        width={Dimensions.get("window").width - 40}
                        height={150}
                        chartConfig={{
                            color: () => "#000",
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        hasLegend={true}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.titulo}>Saídas por Categorias</Text>

                    <PieChart
                        data={datagrafico2}
                        width={Dimensions.get("window").width - 40}
                        height={150}
                        chartConfig={{
                            color: () => "#000",
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        hasLegend={true}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.titulo}>Fluxo Financeiro</Text>

                    <PieChart
                        data={datagrafico3}
                        width={Dimensions.get("window").width - 40}
                        height={140}
                        chartConfig={{
                            color: () => "#000",
                        }}
                        accessor={"valor"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        hasLegend={true}
                    />
                </View>

                <Text></Text>
                <Text></Text>
            </View>
            
        </ScrollView>
        
    );
}

const styles = StyleSheet.create({

    cabecalhoRelatorio: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 8,
        alignItems: 'center',
    },

    tituloRelatorio: {
        fontFamily: 'Inter_700Bold',
        fontSize: 22,
        color: 'black',
        textAlign: 'center',
    },

    subtituloRelatorio: {
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: '#777',
        marginTop: 4,
        textAlign: 'center',
    },

    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    card: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 20,
        borderRadius: 15,
        marginTop: 12,
        marginLeft: 16,
        marginRight: 16,
    },

    titulo: {
        fontFamily: 'Inter_500Medium',
        color: 'black',
        fontSize: 16,
    },
});