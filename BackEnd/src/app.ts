import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import usuarioRouter from './routers/farmerRouter';
import enderecoRouter from './routers/addressRouters';
import authRouter from './routers/authRouter';
import cookieParser from "cookie-parser";

const app = express();

// cors - liberar acesso do frontend
app.use(cors({
    origin: "http://localhost:3008",
    credentials: true
}));

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());

// ROTAS
app.use("/auth", authRouter);
app.use('/agricultores', usuarioRouter);
app.use('/enderecos', enderecoRouter);

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