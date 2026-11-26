import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, Entypo, MaterialIcons, Octicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import db from '../database/database';
import { useState, useCallback, useContext, useRef, useEffect  } from 'react';
import { PeriodoContext } from '../PeriodoContext';


export default function Inicio() {

    const {
        mesSelecionado,
        setMesSelecionado,
        anoSelecionado,
        setAnoSelecionado
    } = useContext(PeriodoContext);

    const [receitas, setReceitas] = useState(0);
    const [gastosFixos, setGastosFixos] = useState(0);
    const [gastosVariaveis, setGastosVariaveis] = useState(0);
    const [saldo, setSaldo] = useState(0);
    const [despesasMes, setDespesasMes] = useState([]);
    const [gastosPorCartao, setGastosPorCartao] = useState([]);
    const scrollMesesRef = useRef(null);
    const [larguraLista, setLarguraLista] = useState(0);

    useEffect(() => {
        if (larguraLista > 0) {
            const larguraBotao = 60;
            const espacamento = 6;
            const larguraMesAtivo = 70;

            const posicaoMes =
                10 + mesSelecionado * (larguraBotao + espacamento);

            const centroMes = posicaoMes + larguraMesAtivo / 2;

            const deslocamento = Math.max(
                0,
                centroMes - larguraLista / 2
            );

            scrollMesesRef.current?.scrollTo({
                x: deslocamento,
                animated: false,
            });
        }
    }, [larguraLista, mesSelecionado]);

    function carregarDados(mes, ano) {
        const mesFormatado = String(mes + 1).padStart(2, '0');
        const periodo = `${ano}-${mesFormatado}`;

        const registros = db.getAllSync(
            `SELECT registros.*, 
                    cartoes.nome AS nome_cartao,
                    cartoes.ultimos_digitos
            FROM registros
            LEFT JOIN cartoes
            ON registros.cartao_id = cartoes.id
            WHERE substr(registros.data_registro, 1, 7) = ?`,
            periodo
        );

        const despesas = registros.filter(
            item =>
                item.tipo === 'fixo' ||
                item.tipo === 'variavel'
        );

        setDespesasMes(despesas);

        const resultadoCartoes = db.getAllSync(
            `SELECT
                c.id,
                c.nome,
                c.ultimos_digitos,
                SUM(r.valor) AS total
            FROM registros r
            INNER JOIN cartoes c
                ON c.id = r.cartao_id
            WHERE substr(r.data_registro, 1, 7) = ?
                AND r.tipo IN ('fixo', 'variavel')
            GROUP BY c.id, c.nome, c.ultimos_digitos
            ORDER BY total DESC`,
            periodo
        );

        setGastosPorCartao(resultadoCartoes);

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
        setSaldo(
            totalReceitas -
            totalFixos -
            totalVariaveis
        );
    }

    useFocusEffect(
        useCallback(() => {
            carregarDados(mesSelecionado, anoSelecionado);
        }, [mesSelecionado, anoSelecionado])
    );

    const percentualDespesas =
        receitas > 0
            ? (((gastosFixos + gastosVariaveis) / receitas) * 100).toFixed(0)
            : 0;

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <ScrollView
                ref={scrollMesesRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardBotoes}
                onLayout={(event) => {
                    setLarguraLista(event.nativeEvent.layout.width);
                }}
            >
                {[
                    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
                ].map((mes, index) => (

                    <TouchableOpacity
                        key={mes}
                        onPress={() => setMesSelecionado(index)}
                        style={
                            index === mesSelecionado
                                ? styles.botoesAtivo
                                : styles.botoes
                        }
                    >
                        <Text
                            style={
                                index === mesSelecionado
                                    ? styles.botoesTextoAtivo
                                    : styles.botoesTexto
                            }
                        >
                            {mes}
                        </Text>
                    </TouchableOpacity>
                ))}
                
            </ScrollView>
            <View style={styles.card}>
                <Text style={styles.texto}>Receitas:</Text>
                <Text style={styles.titulo}>
                    R$ {receitas.toFixed(2)}
                </Text>
                <Text style={styles.legenda}>
                    Total recebido no mês
                </Text>

                <Text></Text>

                <Text style={styles.texto}>Despesa Mensal:</Text>
                <Text style={styles.titulo}>
                    R$ {(gastosFixos + gastosVariaveis).toFixed(2)}
                </Text>
                <Text style={styles.legenda}>
                    {percentualDespesas}% da renda total
                </Text>

                <Text></Text>

                <Text
                    style={[
                        styles.titulo,
                        {
                            color: saldo < 0 ? '#D32F2F' : '#0F8C33',
                        },
                    ]}
                >
                    R$ {saldo.toFixed(2)}
                </Text>
                <Text style={styles.legenda}>
                    Valor disponível
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.tituloAlt}>Gastos do mês</Text>
                
                {despesasMes.length > 0 ? (
                    despesasMes.map((item) => (
                        <View
                            key={item.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 16,
                            }}
                        >
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 6,
                                }}>
                                    <Text style={styles.descricaoDespesa}>
                                        {item.descricao}
                                    </Text>

                                    <Text style={{
                                        fontSize: 10,
                                        color: '#777',
                                        backgroundColor: '#F0F0F0',
                                        paddingHorizontal: 6,
                                        paddingVertical: 3,
                                        borderRadius: 5,
                                    }}>
                                        {item.nome_cartao
                                            ? `${item.nome_cartao} •••• ${item.ultimos_digitos}`
                                            : 'Sem cartão'}
                                    </Text>

                                    <Text style={{
                                        fontSize: 11,
                                        color: '#333',
                                        marginTop: 4,
                                    }}>
                                        {item.data_registro
                                            ? item.data_registro.split('-').reverse().join('/')
                                            : 'Data não informada'}
                                    </Text>

                                </View>
                            </View>

                            <Text style={styles.valorDespesa}>
                                R$ {Number(item.valor).toFixed(2).replace('.', ',')}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.legenda}>
                        Nenhum gasto registrado neste mês.
                    </Text>
                )}
            </View>

            <View style={styles.card}>

                <View style={styles.emoji}>
                    <Entypo name="credit-card" size={20} />

                    <Text style={styles.texto}>
                        Fatura cartão de crédito:
                    </Text>
                </View>

                {gastosPorCartao.length > 0 ? (

                    gastosPorCartao.map((item) => (

                        <View
                            key={item.id}
                            style={styles.itemDespesa}
                        >
                            <View style={{ flex: 1 }}>

                                <Text style={styles.descricaoDespesa}>
                                    {item.nome}
                                </Text>

                                <Text style={styles.legenda}>
                                    Final {item.ultimos_digitos}
                                </Text>

                            </View>

                            <Text style={styles.valorDespesa}>
                                {Number(item.total).toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                })}
                            </Text>

                        </View>

                    ))

                ) : (

                    <Text style={styles.legenda}>
                        Nenhum gasto com cartão neste mês.
                    </Text>

                )}

            </View>
        </ScrollView>

    );
}

const styles = StyleSheet.create({

    itemDespesa: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },

    descricaoDespesa: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: 'black',
        flex: 1,
    },

    valorDespesa: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: '#F44336',
        marginLeft: 10,
    },

    container: {
        flex: 1,
        backgroundColor: 'white',
    },

    cardBotoes: {
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },

    botoes: {
        width: 60,
        backgroundColor: '#F6F6F6',
        padding: 10,
        borderRadius: 20,
    },

    botoesTexto: {
        textAlign: 'center',
        fontFamily: 'Inter_500Medium',
        color: 'black',
        fontSize: 16,
    },

    botoesAtivo: {
        width: 70,
        backgroundColor: 'black',
        padding: 10,
        borderRadius: 20,
    },

    botoesTextoAtivo: {
        textAlign: 'center',
        fontFamily: 'Inter_500Medium',
        color: 'white',
        fontSize: 16,

    },

    card: {
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        padding: 20,
        borderRadius: 15,
        marginBottom: 12,
        marginLeft: 16,
        marginRight: 16,
    },

    emoji: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    tituloApp: {
        fontFamily: 'Inter_700Bold',
        color: 'black',
        fontSize: 24,
    },

    titulo: {
        fontFamily: 'Inter_600SemiBold',
        color: 'black',
        fontSize: 24,
    },

    tituloAlt: {
        fontFamily: 'Inter_600SemiBold',
        color: 'black',
        fontSize: 19,
        paddingVertical: 8,
    },

    texto: {
        fontFamily: 'Inter_500Medium',
        color: 'black',
        fontSize: 16,
    },

    legenda: {
        fontFamily: 'Inter_400Regular',
        color: '#828282',
        fontSize: 12,
    },

    categoriaDespesa: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    },

    textoCategoria: {
        fontSize: 11,
        color: '#555',
    },

    infoCartao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },

    textoCartao: {
        fontSize: 11,
        color: '#888',
    },
});