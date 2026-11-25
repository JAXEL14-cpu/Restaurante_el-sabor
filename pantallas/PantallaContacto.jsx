import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../tema';
import { comunes } from '../estilos';
import { datosRestaurante } from '../datos/platos';

const FILAS = [
  { icono: 'location-outline', titulo: 'Dirección', dato: datosRestaurante.direccion },
  { icono: 'call-outline', titulo: 'Teléfono / WhatsApp', dato: datosRestaurante.telefono },
  { icono: 'time-outline', titulo: 'Horario de atención', dato: datosRestaurante.horario },
];

export default function PantallaContacto() {
  return (
    <ScrollView style={comunes.pantalla} contentContainerStyle={comunes.contenido}>
      <Text style={comunes.aviso}>Aquí encontrarás cómo comunicarte con Restaurante El Sabor y consultar sus horarios.</Text>
      {FILAS.map((fila) => (
        <View key={fila.titulo} style={comunes.tarjeta}>
          <View style={s.titulo}>
            <Ionicons name={fila.icono} size={18} color={colores.dorado} />
            <Text style={s.textoTitulo}>{fila.titulo}</Text>
          </View>
          <Text style={s.dato}>{fila.dato}</Text>
        </View>
      ))}
      <View style={s.avisoDemo}>
        <Text style={comunes.texto}>Estos datos son ficticios para la demostración. Confirma la dirección, el teléfono y el horario reales antes de publicar.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  titulo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoTitulo: { color: colores.dorado, fontSize: 15, fontWeight: '800' },
  dato: { color: colores.crema, fontSize: 16 },
  avisoDemo: { padding: 14, borderRadius: 10, backgroundColor: colores.superficieAlta, borderWidth: 1, borderColor: colores.borde },
});
