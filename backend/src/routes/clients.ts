import express from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

const router = express.Router();

const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
});

router.get('/', async (_req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(clients);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar no MySQL' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = clientSchema.parse(req.body);
    const newClient = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Erro detalhado no backend:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = clientSchema.parse(req.body);

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      },
    });

    res.json(updatedClient);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.client.delete({
      where: { id },
    });

    res.json({ message: 'Cliente excluido com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

export default router;
