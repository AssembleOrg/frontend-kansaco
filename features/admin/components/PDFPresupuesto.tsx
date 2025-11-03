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
import { MockOrder } from '../utils/mockOrders';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

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
  clientInfo: {
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
    width: '10%',
    textAlign: 'center',
  },
  colName: {
    width: '40%',
  },
  colPresentation: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '20%',
    textAlign: 'right',
  },
  colTotal: {
    width: '15%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 4,
    marginBottom: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100%',
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 1,
    fontSize: 8,
  },
  totalLabel: {
    marginRight: 12,
    fontWeight: 'normal',
  },
  totalValue: {
    width: '80px',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  finalTotal: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
    paddingTop: 2,
    borderTop: '2px solid #16a245',
    fontSize: 9,
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
  conditionsRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 1,
    fontSize: 8,
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
});

interface PDFPresupuestoProps {
  order: MockOrder;
}

const PresupuestoDocument: React.FC<PDFPresupuestoProps> = ({ order }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

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
              CUIT: XX-XXXXXXXX-X
            </Text>
            <Text style={{ fontSize: 8 }}>
              Localidad: Buenos Aires, Argentina
            </Text>
            <Text style={{ marginTop: 2, fontSize: 8 }}>
              Tel: +54 11 XXXX-XXXX
            </Text>
            <Text style={{ fontSize: 8 }}>Email: ventas@kansaco.com</Text>
          </View>

          <View style={styles.clientInfo}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
              Presupuesto #{order.orderNumber}
            </Text>
            <Text style={{ marginTop: 3, fontSize: 8 }}>
              Fecha: {new Date(order.orderDate).toLocaleDateString('es-AR')}
            </Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>PRESUPUESTO</Text>

        {/* Datos del Cliente */}
        <Text style={styles.sectionTitle}>DATOS DEL CLIENTE</Text>
        <View style={styles.clientDetailsRow}>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Razón Social:</Text>
            <Text style={styles.value}>{order.clientName}</Text>
          </View>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{order.clientEmail}</Text>
          </View>
        </View>
        <View style={styles.clientDetailsRow}>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.value}>{order.clientPhone}</Text>
          </View>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Localidad:</Text>
            <Text style={styles.value}>{order.clientCity}</Text>
          </View>
        </View>
        <View style={styles.clientDetailsRow}>
          <View style={styles.clientDetailsPair}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{order.clientAddress}</Text>
          </View>
        </View>

        {/* Tabla de Productos */}
        <Text style={styles.sectionTitle}>DETALLE DE PRODUCTOS</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colQuantity}>Cant.</Text>
            <Text style={styles.colName}>Producto</Text>
            <Text style={styles.colPresentation}>Presentación</Text>
            <Text style={styles.colPrice}>P. Unit.</Text>
            <Text style={styles.colTotal}>Subtotal</Text>
          </View>

          {order.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colName}>{item.productName}</Text>
              <Text style={styles.colPresentation}>{item.presentation}</Text>
              <Text style={styles.colPrice}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.colTotal}>
                {formatCurrency(item.totalPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (21%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.iva)}</Text>
          </View>
          <View style={styles.finalTotal}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Forma de Pago */}
        <Text style={styles.sectionTitle}>CONDICIONES</Text>
        <View style={styles.conditionsRow}>
          <View style={{ flex: 1 }}>
            <Text>
              <Text style={styles.label}>Forma de Pago:</Text>
              {order.paymentMethod}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text>
              <Text style={styles.label}>Validez:</Text>
              15 días
            </Text>
          </View>
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
              Este presupuesto no tiene validez como documento fiscal.
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text>Para consultas o cambios, contacte a ventas@kansaco.com</Text>
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

export function PDFDownloadButton({ order }: { order: MockOrder }) {
  return (
    <PDFDownloadLink
      document={<PresupuestoDocument order={order} />}
      fileName={`Presupuesto_${order.orderNumber}_${order.clientName.replace(/\s+/g, '_')}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {loading ? 'Generando...' : 'Descargar PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
