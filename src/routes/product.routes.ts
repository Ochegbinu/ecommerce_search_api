import { Router } from 'express';
import { addProduct, search, suggest, getAllProducts, getFilters } from '../controllers/product.controller.js';

const router: Router = Router();

router.get('/products', getAllProducts);
router.post('/products', addProduct);
router.get('/search', search);
router.get('/suggest', suggest);
router.get('/filters', getFilters);

export default router;
