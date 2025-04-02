import { createContext, useState, useEffect } from "react";
import { api } from "../utils/api";

export const CartContext = createContext<{
	carts: { string?: OrderItem[] } | null;
	customer: User | null;
	customerOrder: Partial<Order>;
	setCurrentCustomer: (customer: User) => void;
	prepareOrder: (field: keyof Order, value: any) => void;
	addToCart: (item: Product, meta: Record<string, any>) => void;
	updateCart: (item: OrderItem, quantity: number) => void;
	removeFromCart: (item: Product) => void;
	clearCart: () => void;
	getCartTotal: (vendorId?: string) => number;
	createOrder: (vendorId: string, meta: Record<string, any>) => Promise<Order>;
	recordPayment: (
		paymentId: string,
		payload: Partial<Payment>
	) => Promise<Payment>;
}>({
	carts: null,
	customer: null,
	customerOrder: null,
	setCurrentCustomer: customer => {},
	prepareOrder: (field: string, value: any) => {},
	addToCart: (item, meta) => {},
	updateCart: (item, quantity) => {},
	removeFromCart: item => {},
	clearCart: () => {},
	getCartTotal: vendorId => 0,
	createOrder: async (vendorId: string) => null,
	recordPayment: async (paymentId: string, payload: Partial<Payment>) => null,
});

export const CartContextProvider = ({ children }) => {
	const [carts, setCarts] = useState<{
		string?: OrderItem[];
	}>({});
	const [customer, setCustomer] = useState<User>();
	const [customerOrder, setCustomerOrder] = useState<Partial<Order>>({
		userId: customer?.id,
		vendorId: "",
		branchId: null,
		sectionId: null,
		staffId: null,
		action: "Purchase",
		type: "Instant",
		delivery: "Delivery",
		status: "Pending",
		meta: {},
		items: [],
	});

	const setCurrentCustomer = (customer: User) => {
		setCustomer(customer);
	};

	const addToCart = (item: Product, meta: Record<string, any>) => {
		const vendorCart = carts[item.vendorId] || [];

		const isItemInCart = vendorCart.find(p => p.id === item.id);

		if (!isItemInCart) {
			setCarts(prevCarts => ({
				...prevCarts,
				[item.vendorId]: [...vendorCart, ...[{ ...item, quantity: 1, meta }]],
			}));
		}
	};

	const updateCart = (item: Product, quantity: number) => {
		const vendorCart = carts[item.vendorId].map((cartItem: OrderItem) => {
			if (cartItem.id === item.id) {
				return { ...cartItem, quantity };
			}
			return cartItem;
		});
		setCarts(prevCarts => ({ ...prevCarts, [item.vendorId]: vendorCart }));
	};

	const removeFromCart = (item: Product) => {
		const vendorCart = carts[item.vendorId].filter(
			cartItem => cartItem.id !== item.id
		);
		setCarts(prevCarts => ({ ...prevCarts, [item.vendorId]: vendorCart }));
	};

	const clearCart = () => {
		setCarts({});
	};

	const getCartTotal = (vendorId?: string) => {
		if (vendorId) {
			return carts[vendorId].reduce(
				(total: number, item: OrderItem) =>
					total + item.price * item.quantity,
				0
			);
		}

		return Object.keys(carts).reduce((total, vendorId) => {
			return (
				total +
				carts[vendorId].reduce(
					(total: number, item: OrderItem) =>
						total + item.price * item.quantity,
					0
				)
			);
		}, 0);
	};

	const prepareOrder = async (field: string, value: any) => {
		setCustomerOrder({ ...customerOrder, [field]: value });
	};

	const createOrder = async (vendorId: string, meta: Record<string, any>) => {
		try {
			const order = await api.post<Order>("orders", {
				...customerOrder,
				meta,
				vendorId,
				userId: customer?.id,
			});

			return order;
		} catch (error) {
			console.error({ error });
			return null;
		}
	};

	const recordPayment = async (
		paymentId: string,
		payload: Partial<Payment>
	) => {
		try {
			const payment = await api.put<Payment>(
				`payments/${paymentId}`,
				payload
			);
			console.info(payment);

			return payment;
		} catch (error) {
			console.error({ error });
			return null;
		}
	};

	useEffect(() => {
		// localStorage.setItem("carts", JSON.stringify(carts));
	}, [carts]);

	useEffect(() => {
		// const carts = localStorage.getItem("carts");
		// if (carts) {
		//     setCarts(JSON.parse(carts));
		// }
	}, []);

	return (
		<CartContext.Provider
			value={{
				carts,
				customer,
				setCurrentCustomer,
				customerOrder,
				prepareOrder,
				addToCart,
				updateCart,
				removeFromCart,
				clearCart,
				getCartTotal,
				createOrder,
				recordPayment,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};
