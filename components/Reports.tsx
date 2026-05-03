import React, { useMemo } from 'react';
import { Client, Expense, Invoice, InvoiceStatus, WorkOrder } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, FileText, PenSquare, Receipt, TrendingDown, TrendingUp, Wrench } from 'lucide-react';

interface ReportsProps {
  invoices: Invoice[];
  expenses: Expense[];
  workOrders: WorkOrder[];
  clients: Client[];
  onOpenOrders: () => void;
  onOpenInvoices: () => void;
  onEditWorkOrder: (order: WorkOrder) => void;
  onEditInvoice: (invoice: Invoice) => void;
}

const Reports: React.FC<ReportsProps> = ({
  invoices,
  expenses,
  workOrders,
  clients,
  onOpenOrders,
  onOpenInvoices,
  onEditWorkOrder,
  onEditInvoice,
}) => {
  const financialSummary = useMemo(() => {
    const totalRevenue = invoices
      .filter((invoice) => invoice.status === InvoiceStatus.Pago)
      .reduce((sum, invoice) => sum + invoice.total, 0);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return { totalRevenue, totalExpenses, netProfit };
  }, [invoices, expenses]);

  const monthlyData = useMemo(() => {
    const dataByMonth: Record<string, { revenue: number; expenses: number; sortDate: number }> = {};

    invoices.forEach((invoice) => {
      if (invoice.status !== InvoiceStatus.Pago) {
        return;
      }

      const issueDate = new Date(invoice.issueDate);
      const month = issueDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!dataByMonth[month]) {
        dataByMonth[month] = { revenue: 0, expenses: 0, sortDate: issueDate.getTime() };
      }
      dataByMonth[month].revenue += invoice.total;
    });

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const month = expenseDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!dataByMonth[month]) {
        dataByMonth[month] = { revenue: 0, expenses: 0, sortDate: expenseDate.getTime() };
      }
      dataByMonth[month].expenses += expense.amount;
    });

    return Object.entries(dataByMonth)
      .map(([name, values]) => ({
        name,
        sortDate: values.sortDate,
        Faturamento: values.revenue,
        Despesas: values.expenses,
      }))
      .sort((a, b) => a.sortDate - b.sortDate);
  }, [invoices, expenses]);

  const recentWorkOrders = useMemo(
    () =>
      [...workOrders]
        .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
        .slice(0, 5),
    [workOrders]
  );

  const recentInvoices = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
        .slice(0, 5),
    [invoices]
  );

  const getClientName = (clientId: string) => clients.find((client) => client.id === clientId)?.name || 'Cliente';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumo Financeiro Anual</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Acesse rapidamente ordens de servico e faturas a partir dos relatorios.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenOrders}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              <Wrench size={16} />
              Abrir Ordens
            </button>
            <button
              onClick={onOpenInvoices}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-800 transition-colors"
            >
              <Receipt size={16} />
              Abrir Faturas
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-2 text-green-500">
              <DollarSign size={20} />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Faturamento Total</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(financialSummary.totalRevenue)}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 text-red-500">
              <TrendingDown size={20} />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Despesas Totais</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(financialSummary.totalExpenses)}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 text-blue-500">
              <TrendingUp size={20} />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Lucro Liquido</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(financialSummary.netProfit)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Desempenho Mensal</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `R$${value}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: 'rgba(55, 65, 81, 1)',
                color: '#ffffff'
              }}
              cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
            />
            <Legend />
            <Bar dataKey="Faturamento" fill="#3b82f6" name="Faturamento" />
            <Bar dataKey="Despesas" fill="#ef4444" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="text-blue-500" size={18} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ordens Recentes</h3>
            </div>
            <button
              onClick={onOpenOrders}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {recentWorkOrders.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma ordem de servico encontrada.</p>
            ) : (
              recentWorkOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{getClientName(order.clientId)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.serviceType}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.scheduledDate)}</p>
                    </div>
                    <button
                      onClick={() => onEditWorkOrder(order)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      <PenSquare size={14} />
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-500" size={18} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Faturas Recentes</h3>
            </div>
            <button
              onClick={onOpenInvoices}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma fatura encontrada.</p>
            ) : (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{getClientName(invoice.clientId)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.issueDate)} • {formatCurrency(invoice.total)}
                      </p>
                    </div>
                    <button
                      onClick={() => onEditInvoice(invoice)}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300"
                    >
                      <PenSquare size={14} />
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
