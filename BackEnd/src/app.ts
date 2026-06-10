import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import usuarioRouter from './routers/farmerRouter';
import enderecoRouter from './routers/addressRouter';
import authRouter from './routers/authRouter';
import cookieParser from "cookie-parser";
import productRouter from './routers/productRouter';
import categoryRouter from './routers/categoryRouter';
import paymentRouter from './routers/paymentRouter';
import deliveryRouter from './routers/deliveryRouter';
import client from 'prom-client';
//import { setupMonitoring } from './monitoring';

const app = express();

// cors - liberar acesso do frontend
app.use(cors({
  origin: [
    'http://localhost:3008',
'https://agro-familia.vercel.app'
  ],
  credentials: true
}));

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());

// ROTAS
app.use("/auth", authRouter);
app.use('/farmer', usuarioRouter);
app.use('/address', enderecoRouter);
app.use('/products', productRouter);
app.use('/category', categoryRouter);
app.use('/farmers', paymentRouter); // Rota para métodos de pagamento, importada dinamicamente para evitar problemas de dependência circular
app.use('/delivery', deliveryRouter); // Rota para métodos de entrega, importada dinamicamente para evitar problemas de dependência circular

// rota padrão
app.use((req: Request, res: Response) => {
    res.send("API do AgroFamilia!");
});

// erro
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send(err.message);
});

export default app;
