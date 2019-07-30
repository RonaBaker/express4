import { Request, Response, NextFunction, Router } from 'express';
import uuidv1 from 'uuid/v1';
import products from '../products.json';
import categories from '../categories.json';
import { Product } from '../models/product';
import { Category } from '../models/category';
import { schema } from '../validations/product';
import joi from 'joi';

const productRouter = Router();
const categoryRouter = Router();

function findProductIndex(req: Request, res: Response, next: NextFunction) {
  res.locals.elements = products;
  next();
}

function findCategoryIndex(req: Request, res: Response, next: NextFunction) {
  res.locals.elements = categories;
  next();
}

function findElementIndex(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id;
  const matchingIndex = res.locals.elements.findIndex((o: typeof res.locals.elements) => o.id === id);
  if (matchingIndex < 0) {
    res.locals.validationError = 'not_found';
    next(new Error('Not Found'));
  }
  res.locals.matchingIndex = matchingIndex;
  res.locals.elementId = id;
  next();
}

function isProduct(object: any): object is Product {
  return object !== undefined;
}

function findProduct(id: string): Promise<Product | undefined> {
  const product = products.find(o => o.id === id);
  if (isProduct(product)) {
    return Promise.resolve(product);
  } else {
    return Promise.reject(product);
  }
}

productRouter.get('/products', (req, res, next) => {
  res.send(products);
});

productRouter.get('/products/:id', checkIdLength, (req, res, next) => {
  findProduct(req.params.id)
    .then((product) => res.send(product))
    .catch(() => {
      res.locals.validationError = 'not_found';
      next(new Error('Product not found'));
    });
});

productRouter.post('/products', checkNameLength, (req, res, next) => {
  const product: Product = req.body;
  product.id = uuidv1();
  products.push(product);
  res.status(201).send(product);
});

productRouter.put('/products/:id', checkIdAndNameLength, findProductIndex, findElementIndex, (req, res, next) => {
  const { elementId, matchingIndex } = res.locals;
  const prod: Product = req.body;
  prod.id = elementId;
  products[matchingIndex] = prod;
  res.send(prod);
});

productRouter.delete('/products/:id', checkIdLength, findProductIndex, findElementIndex, (req, res) => {
  products.splice(res.locals.matchingIndex, 1);
  res.sendStatus(204);
},
);

categoryRouter.get('/categories', (req, res) => {
  res.send(categories);
});

categoryRouter.get('/categories/:id/products', checkIdLength, (req, res, next) => {
  const categoryId = req.params.id;
  const matchingCat = categories.find(o => o.id === categoryId);
  const matchingProd = products.filter(o => o.categoryId === categoryId);
  if (matchingProd.length === 0) { // If length is 0 then check if the category exist; if it is 0, it's ok to send empty array, otherwise 404
    if (!matchingCat) {
      res.locals.validationError = 'not_found';
      next(new Error('Category not found'));
    }
  }
  res.send(matchingProd);
});

function findCategory(id: string): Promise<Category | undefined> {
  const category = categories.find(o => o.id === id);
  if (isProduct(category)) {
    return Promise.resolve(category);
  } else {
    return Promise.reject(category);
  }
}

categoryRouter.get('/categories/:id', checkIdLength, (req, res, next) => {
  findCategory(req.params.id)
    .then((category) => res.send(category))
    .catch(() => {
      res.locals.validationError = 'not_found';
      next(new Error('Category not found'));
    });
});

categoryRouter.post('/categories', (req, res) => {
  const category: Category = req.body;
  category.id = uuidv1();
  categories.push(category);
  res.status(201).send(category);
});

categoryRouter.put('/categories/:id', checkIdLength, findCategoryIndex, findElementIndex, (req, res) => {
  const { elementId, matchingIndex } = res.locals;
  const category: Category = req.body;
  category.id = elementId;
  categories[matchingIndex] = category;
  res.send(category);
});

categoryRouter.delete('/categories/:id', checkIdLength, findCategoryIndex, findElementIndex, (req, res) => {
  categories.splice(res.locals.matchingIndex, 1);
  res.sendStatus(204);
},
);

function checkIdLength(req: Request, res: Response, next: NextFunction) {
  const { error } = joi.validate({ id: req.params.id } as Product, schema);
  if (error) {
    next(new Error(error.message));
  }
  next();
}

function checkIdAndNameLength(req: Request, res: Response, next: NextFunction) {
  const { error } = joi.validate({ id: req.params.id, name: req.body.name } as Product,
    schema, { abortEarly: false });
  if (error) {
    next(new Error(error.message));
  }
  next();
}

function checkNameLength(req: Request, res: Response, next: NextFunction) {
  const { error } = joi.validate({name: req.body.name } as Product,
    schema, { abortEarly: false });
  if (error) {
    next(new Error(error.message));
  }
  next();
}

export { productRouter };
export { categoryRouter };
