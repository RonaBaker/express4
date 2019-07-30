import express from 'express';
import cors from 'cors';
import { categoryRouter , productRouter } from './routes/products';
import {errorHandler} from './middleware/error';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', productRouter);
app.use('/api', categoryRouter);

app.use(errorHandler);

export {app};
