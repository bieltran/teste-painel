import React, { useEffect, useMemo, useState } from 'react';
import { Client, Invoice, Project, Quote } from '../types';
import { Briefcase, DollarSign, FileText, FolderOpen, Receipt, User } from 'lucide-react';
import InvoiceList from './InvoiceList';
import QuoteList from './QuoteList';
import ProjectList from './ProjectList';

interface ClientPortalProps {
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  projects: Project[];
  onOpenClients: () => void;
  onOpenQuotes: () => void;
  onOpenInvoices: () => void;
  onOpenProjects: () => void;
  onEditQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onViewProjectDetails: (projectId: string) => void;
  onRefreshQuotes?: () => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({
  clients,
  invoices,
  quotes,
  projects,
  onOpenClients,
  onOpenQuotes,
  onOpenInvoices,
  onOpenProjects,
  onEditQuote,
  onDeleteQuote,
  onEditInvoice,
  onDeleteInvoice,
  onEditProject,
  onDeleteProject,
  onViewProjectDetails,
  onRefreshQuotes,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);

  useEffect(() => {
    if (!clients.length) {
      setSelectedClientId(null);
      return;
    }

    const selectedStillExists = clients.some((client) => client.id === selectedClientId);
    if (!selectedStillExists) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const selectedClientData = useMemo(() => {
    if (!selectedClientId) {
      return null;
    }

    return {
      client: clients.find((client) => client.id === selectedClientId),
      invoices: invoices.filter((invoice) => invoice.clientId === selectedClientId),
      quotes: quotes.filter((quote) => quote.clientId === selectedClientId),
      projects: projects.filter((project) => project.clientId === selectedClientId),
    };
  }, [selectedClientId, clients, invoices, quotes, projects]);

  const selectedClient = selectedClientData?.client;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <label htmlFor="client-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selecione um cliente para visualizar o portal
            </label>
            <select
              id="client-select"
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full max-w-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="" disabled>Selecione...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenClients}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-800 transition-colors"
            >
              <User size={16} />
              Abrir Clientes
            </button>
            <button
              onClick={onOpenProjects}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
            >
              <Briefcase size={16} />
              Abrir Projetos
            </button>
            <button
              onClick={onOpenQuotes}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
            >
              <FileText size={16} />
              Abrir Orcamentos
            </button>
            <button
              onClick={onOpenInvoices}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
            >
              <Receipt size={16} />
              Abrir Faturas
            </button>
          </div>
        </div>
      </div>

      {selectedClient ? (
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md">
            <div className="flex items-center gap-3">
              <FolderOpen className="text-blue-500" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedClient.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedClient.email} • {selectedClient.phone}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Projetos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedClientData?.projects.length || 0}</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Orcamentos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedClientData?.quotes.length || 0}</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Faturas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedClientData?.invoices.length || 0}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Briefcase />
              Projetos
            </h2>
            <ProjectList
              projects={selectedClientData?.projects || []}
              clients={clients}
              onEdit={onEditProject}
              onDelete={onDeleteProject}
              onViewDetails={onViewProjectDetails}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <FileText />
              Orcamentos
            </h2>
            <QuoteList
              quotes={selectedClientData?.quotes || []}
              clients={clients}
              onEdit={onEditQuote}
              onDelete={onDeleteQuote}
              onRefresh={onRefreshQuotes}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <DollarSign />
              Faturas
            </h2>
            <InvoiceList
              invoices={selectedClientData?.invoices || []}
              clients={clients}
              onEdit={onEditInvoice}
              onDelete={onDeleteInvoice}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">Selecione um cliente para ver seus detalhes.</p>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
