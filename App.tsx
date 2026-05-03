import React, { useState, useCallback, useMemo, useEffect, Suspense, lazy } from 'react';
import { WorkOrder, Client, Quote, Invoice, Project, Expense } from './types';
import { Plus } from 'lucide-react';
import {
  authService,
  clientService,
  workOrderService,
  quoteService,
  invoiceService,
  projectService,
  expenseService,
  validateAuth,
} from './services/api';
import { preloadCriticalComponents } from './utils/preload';

import Sidebar from './components/Sidebar';
import Login from './components/Login';

const Dashboard = lazy(() => import('./components/Dashboard'));
const WorkOrderList = lazy(() => import('./components/WorkOrderList'));
const WorkOrderForm = lazy(() => import('./components/WorkOrderForm'));
const ClientList = lazy(() => import('./components/ClientList'));
const ClientForm = lazy(() => import('./components/ClientForm'));
const QuoteList = lazy(() => import('./components/QuoteList'));
const QuoteForm = lazy(() => import('./components/QuoteForm'));
const InvoiceList = lazy(() => import('./components/InvoiceList'));
const InvoiceForm = lazy(() => import('./components/InvoiceForm'));
const ProjectList = lazy(() => import('./components/ProjectList'));
const ProjectForm = lazy(() => import('./components/ProjectForm'));
const ProjectDetails = lazy(() => import('./components/ProjectDetails'));
const ExpenseList = lazy(() => import('./components/ExpenseList'));
const Stock = lazy(() => import('./components/Stock'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings'));
const ClientPortal = lazy(() => import('./components/ClientPortal'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando dados do MySQL...</span>
  </div>
);

export type View = 'dashboard' | 'orders' | 'clients' | 'quotes' | 'invoices' | 'projects' | 'expenses' | 'stock' | 'reports' | 'portal' | 'settings';

const viewTitles: Record<View, string> = {
  dashboard: 'Painel',
  orders: 'Ordens de Servico',
  clients: 'Clientes',
  quotes: 'Orcamentos',
  invoices: 'Faturas',
  projects: 'Projetos',
  expenses: 'Despesas',
  stock: 'Estoque',
  reports: 'Relatorios',
  portal: 'Portal do Cliente',
  settings: 'Configuracoes',
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const [isWorkOrderFormOpen, setWorkOrderFormOpen] = useState(false);
  const [isClientFormOpen, setClientFormOpen] = useState(false);
  const [isQuoteFormOpen, setQuoteFormOpen] = useState(false);
  const [isInvoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [isProjectFormOpen, setProjectFormOpen] = useState(false);

  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [clientsData, workOrdersData, quotesData, invoicesData, projectsData, expensesData] = await Promise.all([
      clientService.getAll(),
      workOrderService.getAll(),
      quoteService.getAll(),
      invoiceService.getAll(),
      projectService.getAll(),
      expenseService.getAll(),
    ]);

    setClients(clientsData);
    setWorkOrders(workOrdersData);
    setQuotes(quotesData);
    setInvoices(invoicesData);
    setProjects(projectsData);
    setExpenses(expensesData);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = validateAuth();
        if (authenticated) {
          setIsAuthenticated(true);
          await loadData();
          preloadCriticalComponents();
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais.', error);
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [loadData]);

  const handleLogin = useCallback(async () => {
    setIsAuthenticated(true);
    await loadData();
  }, [loadData]);

  const handleLogout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setClients([]);
    setWorkOrders([]);
    setQuotes([]);
    setInvoices([]);
    setProjects([]);
    setExpenses([]);
    setSelectedProjectId(null);
    setCurrentView('dashboard');
  }, []);

  const handleSaveClient = useCallback(async (client: Client) => {
    try {
      const result = client.id
        ? await clientService.update(client.id, client)
        : await clientService.create(client);

      setClients((prev) =>
        client.id ? prev.map((item) => (item.id === client.id ? result : item)) : [result, ...prev]
      );
      setClientFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar cliente.');
    }
  }, []);

  const handleSaveWorkOrder = useCallback(async (order: WorkOrder) => {
    try {
      const result = order.id
        ? await workOrderService.update(order.id, order)
        : await workOrderService.create(order);

      setWorkOrders((prev) =>
        order.id ? prev.map((item) => (item.id === order.id ? result : item)) : [result, ...prev]
      );
      setWorkOrderFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar ordem de servico.');
    }
  }, []);

  const handleSaveQuote = useCallback(async (quote: Quote) => {
    try {
      const result = quote.id
        ? await quoteService.update(quote.id, quote)
        : await quoteService.create(quote);

      setQuotes((prev) =>
        quote.id ? prev.map((item) => (item.id === quote.id ? result : item)) : [result, ...prev]
      );
      setQuoteFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar orcamento.');
    }
  }, []);

  const handleSaveInvoice = useCallback(async (invoice: Invoice) => {
    try {
      const result = invoice.id
        ? await invoiceService.update(invoice.id, invoice)
        : await invoiceService.create(invoice);

      setInvoices((prev) =>
        invoice.id ? prev.map((item) => (item.id === invoice.id ? result : item)) : [result, ...prev]
      );
      setInvoiceFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar fatura.');
    }
  }, []);

  const handleSaveProject = useCallback(async (project: Project) => {
    try {
      const result = project.id
        ? await projectService.update(project.id, project)
        : await projectService.create(project);

      setProjects((prev) =>
        project.id ? prev.map((item) => (item.id === project.id ? result : item)) : [result, ...prev]
      );
      setProjectFormOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar projeto.');
    }
  }, []);

  const handleDeleteClient = useCallback(async (id: string) => {
    if (!window.confirm('Deseja excluir este cliente?')) return;

    try {
      await clientService.delete(id);
      setClients((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir cliente.');
    }
  }, []);

  const handleDeleteWorkOrder = useCallback(async (id: string) => {
    if (!window.confirm('Deseja excluir esta ordem de servico?')) return;

    try {
      await workOrderService.delete(id);
      setWorkOrders((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir ordem de servico.');
    }
  }, []);

  const handleDeleteQuote = useCallback(async (id: string) => {
    if (!window.confirm('Deseja excluir este orcamento?')) return;

    try {
      await quoteService.delete(id);
      setQuotes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir orcamento.');
    }
  }, []);

  const handleDeleteInvoice = useCallback(async (id: string) => {
    if (!window.confirm('Deseja excluir esta fatura?')) return;

    try {
      await invoiceService.delete(id);
      setInvoices((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir fatura.');
    }
  }, []);

  const handleDeleteProject = useCallback(async (id: string) => {
    if (!window.confirm('Deseja excluir este projeto?')) return;

    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((item) => item.id !== id));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir projeto.');
    }
  }, [selectedProjectId]);

  const handleOpenForm = useCallback((view: View) => {
    switch (view) {
      case 'orders':
        setEditingWorkOrder(null);
        setWorkOrderFormOpen(true);
        break;
      case 'clients':
        setEditingClient(null);
        setClientFormOpen(true);
        break;
      case 'quotes':
        setEditingQuote(null);
        setQuoteFormOpen(true);
        break;
      case 'invoices':
        setEditingInvoice(null);
        setInvoiceFormOpen(true);
        break;
      case 'projects':
        setEditingProject(null);
        setProjectFormOpen(true);
        break;
      default:
        break;
    }
  }, []);

  const viewContent = useMemo(() => {
    const renderWithSuspense = (component: React.ReactNode) => (
      <Suspense fallback={<LoadingSpinner />}>
        {component}
      </Suspense>
    );

    switch (currentView) {
      case 'dashboard':
        return renderWithSuspense(<Dashboard workOrders={workOrders} invoices={invoices} expenses={expenses} projects={projects} />);
      case 'orders':
        return renderWithSuspense(
          <WorkOrderList
            workOrders={workOrders}
            clients={clients}
            onEdit={(order) => {
              setEditingWorkOrder(order);
              setWorkOrderFormOpen(true);
            }}
            onDelete={handleDeleteWorkOrder}
          />
        );
      case 'clients':
        return renderWithSuspense(
          <ClientList
            clients={clients}
            onEdit={(client) => {
              setEditingClient(client);
              setClientFormOpen(true);
            }}
            onDelete={handleDeleteClient}
          />
        );
      case 'quotes':
        return renderWithSuspense(
          <QuoteList
            quotes={quotes}
            clients={clients}
            onEdit={(quote) => {
              setEditingQuote(quote);
              setQuoteFormOpen(true);
            }}
            onDelete={handleDeleteQuote}
            onRefresh={loadData}
          />
        );
      case 'invoices':
        return renderWithSuspense(
          <InvoiceList
            invoices={invoices}
            clients={clients}
            onEdit={(invoice) => {
              setEditingInvoice(invoice);
              setInvoiceFormOpen(true);
            }}
            onDelete={handleDeleteInvoice}
          />
        );
      case 'projects':
        return selectedProjectId
          ? renderWithSuspense(
              <ProjectDetails
                projectId={selectedProjectId}
                onClose={() => setSelectedProjectId(null)}
              />
            )
          : renderWithSuspense(
              <ProjectList
                projects={projects}
                clients={clients}
                onEdit={(project) => {
                  setEditingProject(project);
                  setProjectFormOpen(true);
                }}
                onDelete={handleDeleteProject}
                onViewDetails={(projectId) => setSelectedProjectId(projectId)}
              />
            );
      case 'expenses':
        return renderWithSuspense(<ExpenseList expenses={expenses} />);
      case 'stock':
        return renderWithSuspense(<Stock />);
      case 'reports':
        return renderWithSuspense(
          <Reports
            invoices={invoices}
            expenses={expenses}
            workOrders={workOrders}
            clients={clients}
            onOpenOrders={() => setCurrentView('orders')}
            onOpenInvoices={() => setCurrentView('invoices')}
            onEditWorkOrder={(order) => {
              setEditingWorkOrder(order);
              setWorkOrderFormOpen(true);
              setCurrentView('orders');
            }}
            onEditInvoice={(invoice) => {
              setEditingInvoice(invoice);
              setInvoiceFormOpen(true);
              setCurrentView('invoices');
            }}
          />
        );
      case 'portal':
        return renderWithSuspense(
          <ClientPortal
            clients={clients}
            invoices={invoices}
            quotes={quotes}
            projects={projects}
            onOpenClients={() => setCurrentView('clients')}
            onOpenQuotes={() => setCurrentView('quotes')}
            onOpenInvoices={() => setCurrentView('invoices')}
            onOpenProjects={() => setCurrentView('projects')}
            onEditQuote={(quote) => {
              setEditingQuote(quote);
              setQuoteFormOpen(true);
              setCurrentView('quotes');
            }}
            onDeleteQuote={handleDeleteQuote}
            onEditInvoice={(invoice) => {
              setEditingInvoice(invoice);
              setInvoiceFormOpen(true);
              setCurrentView('invoices');
            }}
            onDeleteInvoice={handleDeleteInvoice}
            onEditProject={(project) => {
              setEditingProject(project);
              setProjectFormOpen(true);
              setCurrentView('projects');
            }}
            onDeleteProject={handleDeleteProject}
            onViewProjectDetails={(projectId) => {
              setSelectedProjectId(projectId);
              setCurrentView('projects');
            }}
            onRefreshQuotes={loadData}
          />
        );
      case 'settings':
        return renderWithSuspense(<Settings />);
      default:
        return renderWithSuspense(<Dashboard workOrders={workOrders} invoices={invoices} expenses={expenses} projects={projects} />);
    }
  }, [
    clients,
    currentView,
    expenses,
    handleDeleteClient,
    handleDeleteInvoice,
    handleDeleteProject,
    handleDeleteQuote,
    handleDeleteWorkOrder,
    invoices,
    loadData,
    projects,
    quotes,
    selectedProjectId,
    workOrders,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{viewTitles[currentView]}</h1>
          {['orders', 'clients', 'quotes', 'invoices', 'projects'].includes(currentView) && !selectedProjectId && (
            <button
              onClick={() => handleOpenForm(currentView)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Adicionar Novo</span>
            </button>
          )}
        </header>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">{viewContent}</div>
      </main>

      {isWorkOrderFormOpen && (
        <Suspense fallback={<LoadingSpinner />}>
          <WorkOrderForm
            workOrder={editingWorkOrder}
            clients={clients}
            onSave={handleSaveWorkOrder}
            onClose={() => setWorkOrderFormOpen(false)}
          />
        </Suspense>
      )}

      {isClientFormOpen && (
        <Suspense fallback={<LoadingSpinner />}>
          <ClientForm
            client={editingClient}
            onSave={handleSaveClient}
            onClose={() => setClientFormOpen(false)}
          />
        </Suspense>
      )}

      {isQuoteFormOpen && (
        <Suspense fallback={<LoadingSpinner />}>
          <QuoteForm
            quote={editingQuote}
            clients={clients}
            onSave={handleSaveQuote}
            onClose={() => setQuoteFormOpen(false)}
          />
        </Suspense>
      )}

      {isInvoiceFormOpen && (
        <Suspense fallback={<LoadingSpinner />}>
          <InvoiceForm
            invoice={editingInvoice}
            clients={clients}
            onSave={handleSaveInvoice}
            onClose={() => setInvoiceFormOpen(false)}
          />
        </Suspense>
      )}

      {isProjectFormOpen && (
        <Suspense fallback={<LoadingSpinner />}>
          <ProjectForm
            project={editingProject}
            quotes={quotes}
            clients={clients}
            onSave={handleSaveProject}
            onClose={() => setProjectFormOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;
