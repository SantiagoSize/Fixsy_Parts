import React from 'react';
import { STORAGE_KEYS } from '../../utils/storageKeys';
import { UserPurchase } from '../../types/user';
import { formatPrice } from '../../utils/price';

const PAGE_SIZE = 10;

export default function SupportPurchases() {
    const [purchases, setPurchases] = React.useState<UserPurchase[]>([]);
    const [page, setPage] = React.useState(1);

    React.useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.mgmtPurchases);
            const list = raw ? JSON.parse(raw) : [];
            const sorted = Array.isArray(list)
                ? list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                : [];
            setPurchases(sorted);
        } catch (e) {
            console.error("Error loading purchases", e);
        }
    }, []);

    const paginated = React.useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return purchases.slice(start, start + PAGE_SIZE);
    }, [purchases, page]);

    const totalPages = Math.ceil(purchases.length / PAGE_SIZE);

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
                <h5 className="mb-0 fw-bold text-primary">
                    <i className="bi bi-cart-fill me-2"></i>Historial de Compras Global
                </h5>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>ID Compra</th>
                                <th>Usuario (ID)</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Items</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4 text-muted">No hay compras registradas.</td></tr>
                            ) : (
                                paginated.map((p: any) => (
                                    <tr key={p.idCompra}>
                                        <td className="font-monospace small">{p.idCompra.slice(0, 8)}...</td>
                                        <td>{p.idUsuario}</td>
                                        <td>{new Date(p.fecha).toLocaleDateString()} {new Date(p.fecha).toLocaleTimeString()}</td>
                                        <td className="fw-bold">{formatPrice(p.total)}</td>
                                        <td>
                                            <span className={`badge bg-${p.status === 'Completado' ? 'success' : 'warning'}`}>
                                                {p.status || 'Completado'}
                                            </span>
                                        </td>
                                        <td>{p.items?.length || 0} productos</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <i className="bi bi-chevron-left"></i> Anterior
                        </button>
                        <span className="text-muted small">Página {page} de {totalPages}</span>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Siguiente <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
