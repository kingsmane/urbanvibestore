import { useCallback, useEffect, useRef, useState } from 'react';
import { FitProfile, INITIAL_FIT_PROFILE, Order, Product, SavedAddress } from '../data/storeData';
import { describeError } from '../services/errors';
import { useServices } from '../services/ServicesContext';
import type { AddressInput } from '../services/types';

/**
 * Seluruh data belanja milik pengguna yang sedang login (katalog, pesanan,
 * alamat, fit profile), dimuat dari server.
 */
export function useShopData() {
  const { shop } = useServices();

  const [products, setProducts] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  const [fitProfile, setFitProfileState] = useState<FitProfile | null>(null);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const list = await shop.listProducts();
      if (!alive.current) return;
      setProducts(list);
      setCatalogError(null);
    } catch (e) {
      if (alive.current) setCatalogError(describeError(e));
    } finally {
      if (alive.current) setCatalogLoading(false);
    }
  }, [shop]);

  const loadOrders = useCallback(async () => {
    try {
      const list = await shop.listMyOrders();
      if (alive.current) setOrders(list);
    } catch {
      /* biarkan daftar lama; halaman akan menampilkan keadaan kosong */
    } finally {
      if (alive.current) setOrdersLoaded(true);
    }
  }, [shop]);

  const loadAddresses = useCallback(async () => {
    try {
      const list = await shop.listAddresses();
      if (alive.current) setAddresses(list);
    } catch {
      /* abaikan */
    } finally {
      if (alive.current) setAddressesLoaded(true);
    }
  }, [shop]);

  useEffect(() => {
    void loadProducts();
    void loadOrders();
    void loadAddresses();
    shop
      .getFitProfile()
      .then((p) => alive.current && setFitProfileState(p))
      .catch(() => undefined);
  }, [shop, loadProducts, loadOrders, loadAddresses]);

  const saveAddress = useCallback(
    async (input: AddressInput) => {
      await shop.saveAddress(input);
      await loadAddresses();
    },
    [shop, loadAddresses]
  );

  const setPrimaryAddress = useCallback(
    async (id: string) => {
      await shop.setPrimaryAddress(id);
      await loadAddresses();
    },
    [shop, loadAddresses]
  );

  const saveFitProfile = useCallback(
    async (profile: FitProfile) => {
      setFitProfileState(profile); // optimistik; server menyimpan di latar belakang
      await shop.saveFitProfile(profile);
    },
    [shop]
  );

  return {
    products,
    catalogLoading,
    catalogError,
    reloadProducts: loadProducts,
    orders,
    ordersLoaded,
    reloadOrders: loadOrders,
    setOrders,
    addresses,
    addressesLoaded,
    saveAddress,
    setPrimaryAddress,
    fitProfile: fitProfile ?? INITIAL_FIT_PROFILE,
    hasFitProfile: fitProfile !== null,
    saveFitProfile,
  };
}
