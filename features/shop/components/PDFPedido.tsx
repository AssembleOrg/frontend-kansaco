'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  PDFDownloadLink,
} from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Order, SendOrderEmailData } from '@/types/order';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 15,
    borderBottom: '2px solid #16a245',
    paddingBottom: 10,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a245',
    width: 60,
    marginRight: 15,
  },
  companyInfo: {
    flex: 1,
    fontSize: 9,
    color: '#333',
    lineHeight: 1.3,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a245',
    marginBottom: 2,
  },
  orderInfo: {
    flex: 1,
    fontSize: 9,
    textAlign: 'right',
    lineHeight: 1.3,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 6,
    marginBottom: 3,
    paddingBottom: 1,
    borderBottom: '1px solid #ddd',
    color: '#16a245',
  },
  clientDetailsRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 1,
    fontSize: 8,
    lineHeight: 1.2,
  },
  clientDetailsPair: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    marginRight: 20,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 4,
    minWidth: 80,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 6,
    marginBottom: 6,
    borderTop: '2px solid #16a245',
    borderBottom: '2px solid #16a245',
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ccc',
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '1px solid #eee',
    paddingVertical: 2,
    paddingHorizontal: 3,
    fontSize: 8,
  },
  colQuantity: {
    width: '15%',
    textAlign: 'center',
  },
  colName: {
    width: '85%',
  },
  footer: {
    marginTop: 12,
    paddingTop: 8,
    borderTop: '1px solid #ccc',
    fontSize: 7,
    color: '#666',
  },
  footerRow: {
    marginBottom: 2,
  },
  notasSection: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#f9f9f9',
    borderLeft: '3px solid #16a245',
  },
  watermark: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.08,
    pointerEvents: 'none',
  },
  watermarkText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#16a245',
    transform: 'rotate(45deg)',
    width: '300px',
    textAlign: 'center',
    margin: '35px',
  },
  customerTypeTag: {
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginTop: 4,
  },
});

// Tipo que acepta tanto Order (del backend) como SendOrderEmailData con orderDate (legacy)
type OrderData = Order | (SendOrderEmailData & { orderDate: string });

interface PDFPedidoProps {
  order: OrderData;
}

// Helper para obtener la fecha
function getOrderDate(order: OrderData): string {
  if ('createdAt' in order) {
    return order.createdAt;
  }
  return order.orderDate;
}

const PedidoDocument: React.FC<PDFPedidoProps> = ({ order }) => {
  const isMayorista = order.customerType === 'CLIENTE_MAYORISTA';
  const orderNumber = `PED-${Date.now().toString().slice(-8)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Marca de Agua */}
        <View style={styles.watermark}>
          <Text style={styles.watermarkText}>KANSACO</Text>
          <Text style={styles.watermarkText}>KANSACO</Text>
          <Text style={styles.watermarkText}>KANSACO</Text>
          <Text style={styles.watermarkText}>KANSACO</Text>
          <Text style={styles.watermarkText}>KANSACO</Text>
          <Text style={styles.watermarkText}>KANSACO</Text>
        </View>

        {/* Header con Logo y Datos Empresa */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Image
              src="/Kansaco-logo-negro.png"
              style={{
                width: 50,
                height: 50,
              }}
            />
          </View>

          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>KANSACO</Text>
            <Text style={{ marginTop: 3, fontSize: 8 }}>
              Lubricantes y Aceites
            </Text>
            <Text style={{ fontSize: 8 }}>
              Buenos Aires, Argentina
            </Text>
            <Text style={{ marginTop: 2, fontSize: 8 }}>
              Email: ventas@kansaco.com
            </Text>
          </View>

          <View style={styles.orderInfo}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
              Comprobante de Pedido
            </Text>
            <Text style={{ marginTop: 3, fontSize: 8 }}>
              Fecha: {new Date(getOrderDate(order)).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={{
              marginTop: 4,
              fontSize: 7,
              backgroundColor: isMayorista ? '#fef3c7' : '#dbeafe',
              padding: 2,
              borderRadius: 2,
            }}>
              {isMayorista ? 'MAYORISTA' : 'MINORISTA'}
            </Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>COMPROBANTE DE PEDIDO</Text>

        {/* Datos del Cliente */}
        <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
        <View style={styles.clientDetailsRow}>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Nombre:</Text>
            <Text style={styles.value}>{order.contactInfo.fullName}</Text>
          </View>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{order.contactInfo.email}</Text>
          </View>
        </View>
        <View style={styles.clientDetailsRow}>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{order.contactInfo.phone}</Text>
          </View>
        </View>
        <View style={styles.clientDetailsRow}>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{order.contactInfo.address}</Text>
          </View>
        </View>

        {/* Datos Fiscales (solo mayoristas) */}
        {isMayorista && order.businessInfo && (
          <>
            <Text style={styles.sectionTitle}>DATOS FISCALES</Text>
            <View style={styles.clientDetailsRow}>
              <View style={styles.clientDetailsPair}>
                <Text style={styles.label}>CUIT:</Text>
                <Text style={styles.value}>{order.businessInfo.cuit}</Text>
              </View>
              <View style={styles.clientDetailsPair}>
                <Text style={styles.label}>Situación AFIP:</Text>
                <Text style={styles.value}>{order.businessInfo.situacionAfip}</Text>
              </View>
            </View>
            {order.businessInfo.razonSocial && (
              <View style={styles.clientDetailsRow}>
                <View style={styles.clientDetailsPair}>
                  <Text style={styles.label}>Razón Social:</Text>
                  <Text style={styles.value}>{order.businessInfo.razonSocial}</Text>
                </View>
              </View>
            )}
            {order.businessInfo.codigoPostal && (
              <View style={styles.clientDetailsRow}>
                <View style={styles.clientDetailsPair}>
                  <Text style={styles.label}>Código Postal:</Text>
                  <Text style={styles.value}>{order.businessInfo.codigoPostal}</Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* Tabla de Productos */}
        <Text style={styles.sectionTitle}>PRODUCTOS SOLICITADOS</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colQuantity}>Cant.</Text>
            <Text style={styles.colName}>Producto</Text>
          </View>

          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colName}>{item.productName}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 4, fontSize: 8, color: '#666' }}>
          <Text>Total de productos: {order.items.reduce((acc, item) => acc + item.quantity, 0)} unidades</Text>
        </View>

        {/* Notas */}
        {order.notes && (
          <View style={styles.notasSection}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>NOTAS:</Text>
            <Text>{order.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#999' }}>
              NO VÁLIDO COMO FACTURA
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text>
              Este comprobante es solo una confirmación de pedido y no tiene validez fiscal.
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text>
              Un representante de Kansaco se comunicará para coordinar pago y envío.
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text>Para consultas: ventas@kansaco.com</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={{ fontSize: 7, color: '#999' }}>
              Documento generado el{' '}
              {new Date().toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export function PDFPedidoDownloadButton({ order }: { order: OrderData }) {
  const fileName = `Pedido_Kansaco_${order.contactInfo.fullName.replace(/\s+/g, '_')}_${new Date(getOrderDate(order)).toLocaleDateString('es-AR').replace(/\//g, '-')}.pdf`;

  return (
    <PDFDownloadLink
      document={<PedidoDocument order={order} />}
      fileName={fileName}
    >
      {({ loading }) => (
        <Button
          disabled={loading}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          {loading ? 'Generando...' : 'Descargar Comprobante PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
