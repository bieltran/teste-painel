import express from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = express.Router();

// Validação de dados (Schema do Zod)
const workOrderSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  serviceType: z.string().min(2, 'Tipo de serviço é obrigatório'),
  technician: z.string().min(2, 'Técnico é obrigatório'),
  scheduledDate: z.string().min(1, 'Data é obrigatória'),
  status: z.string().optional(),
  value: z.number().positive('Valor deve ser positivo'),
});

router.use(authenticateToken);

// LISTAR TODAS AS ORDENS
router.get('/', async (req, res) => {
  try {
    const workOrders = await prisma.workOrder.findMany({
      include: {
        client: true // Isso traz os dados do cliente junto
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(workOrders);
  } catch (error) {
    console.error('Erro ao buscar ordens:', error);
    res.status(500).json({ error: 'Erro ao carregar ordens de serviço' });
  }
});

// CADASTRAR NOVA ORDEM
router.post('/', async (req, res) => {
  try {
    const data = workOrderSchema.parse(req.body);
    
    const workOrder = await prisma.workOrder.create({
      data: {
        clientId: data.clientId,
        serviceType: data.serviceType,
        technician: data.technician,
        scheduledDate: new Date(data.scheduledDate),
        status: data.status || 'PENDENTE',
        value: data.value,
      },
      include: {
        client: true
      }
    });

    res.status(201).json(workOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Erro ao criar ordem:', error);
    res.status(500).json({ error: 'Erro ao salvar no banco' });
  }
});

// EDITAR ORDEM EXISTENTE
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = workOrderSchema.parse(req.body);

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: {
        clientId: data.clientId,
        serviceType: data.serviceType,
        technician: data.technician,
        scheduledDate: new Date(data.scheduledDate),
        status: data.status,
        value: data.value,
      },
      include: { client: true }
    });

    res.json(workOrder);
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem de serviço' });
  }
});

// DELETAR ORDEM
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.workOrder.delete({
      where: { id }
    });

    res.json({ message: 'Ordem deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro ao excluir ordem' });
  }
});

export default router;