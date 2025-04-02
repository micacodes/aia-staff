declare module "*.css";
declare module "*.svg";

type PaginationMeta = {
	total: number;
	perPage: number;
	currentPage: number;
	lastPage: number;
	firstPage: number;
	firstPageUrl: string;
	lastPageUrl: string;
	nextPageUrl: string | null;
	previousPageUrl: string | null;
};

interface AttachmentContract {
	name: string;
	url: string;
	size: number;
	extname: string;
	mimeType: string;
	isLocal: boolean;
	isPersisted: boolean;
	isDeleted: boolean;
}

interface DatabaseNotification {
	id: string;
	data: Record<string, string | number | any>;
	createdAt: string;
	updatedAt: string;
	readAt: string;
}

interface Role {
	id: string;
	name: string;
}

interface Permission {
	id: string;
	name: string;
}

interface User {
	id: string;
	firstName: string;
	lastName: string;
	gender: string | null;
	dob: string | null;
	email: string;
	phone: string;
	idpass: string | null;
	rememberMeToken: string | null;
	details: string | null;
	location: Record<string, any> | null;
	geom: string | null;
	avatar: AttachmentContract | null;
	createdAt: string;
	updatedAt: string;
	name: string;
	status: string;
	avatarUrl: string;
	initials: string;
	password: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	roles: Role[];
	permissions: Permission[];
	notifications: DatabaseNotification[];
	devices: Device[];
}

interface CustomerGroup {
	id: string;
	vendorId: string;
	branchId: string;
	name: string;
	details: string;
	image: AttachmentContract;
	createdAt: string;
	updatedAt: string;
}

interface FieldType {
	key: string;
	label: string;
}

interface FieldOPtion {
	value: string;
	label: string;
}

interface FormField {
	id: string | number;
	name: string;
	label: string;
	defaultValue: string;
	type: string;
	placeholder: string;
	required: boolean;
	attrs?: Record<string, string | number | boolean>;
	options?: Record<string, string | number>[];
}

interface FormSection {
	id: string | number;
	name: string;
	details: string;
	skippable?: boolean;
	fields: FormField[];
}

interface ProductForm {
	id: string;
	name: string;
	details: string;
	sections: FormSection[];
	action: "Save" | "Send" | "Save and Send";
	link: string;
	image: AttachmentContract;
	productId: string;
	auth: Record<string, unknown>;
	headers: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
}

interface FormTemplate {
	id: string;
	name: string;
	details: string;
	image: AttachmentContract | null;
	sections: Record<string, unknown>[];
	productId: string;
	createdAt: string;
	updatedAt: string;
}

interface MessageTemplate {
	id: string;
	name: string;
	content: string;
	slug: string;
	active: boolean;
	createdAt: DateTime;
	updatedAt: DateTime;
	deletedAt: DateTime;
	image: AttachmentContract | null;
	imageUrl: string;
	messages: Message[];
}

interface Message {
	id: string;
	details: string;
	userId: string;
	templateId: string;
	createdAt: DateTime;
	updatedAt: DateTime;
	deletedAt: DateTime;
	template: MessageTemplate;
	author: User;
}
interface Address {
	id: string;
	name: string;
	details: string;
	primary: boolean;
	phone: string;
	userId: string;
	location: Record<string, any> | null;
	geom: string | null;
	createdAt: string;
	updatedAt: string;
	user: User;
}

interface Device {
	id: string;
	name: string;
	details: string;
	token: string;
	userId: string;
	status: string;
	meta: Record<string, any>;
}

interface VendorType {
	id: string;
	name: string;
	details: string;
	serviceId: string;
	image: AttachmentContract | null;
	createdAt: string;
	updatedAt: string;

	service: Service;
}

interface VendorCategory {
	id: string;
	name: string;
	details: string;
	image: AttachmentContract | null;
	vendorTypeId: string;
	createdAt: string;
	updatedAt: string;
	type: VendorType;
}

interface Vendor {
	id: string;
	name: string;
	email: string;
	phone: string;
	reg: string;
	kra: string;
	permit: string;
	details: string | null;
	location: Record<string, any> | null;
	geom: string | null;
	logo: AttachmentContract | null;
	hours: Record<string, { open: string; close: string }> | null;
	createdAt: string;
	updatedAt: string;
	logoUrl: string;
	vendorCategoryId: string;
	createdAt: string;
	updatedAt: string;
	category: VendorCategory;
	employees: (User & {
		role: string;
	})[];
}

interface Branch {
	id: string;
	name: string;
	details: string;
	vendorId: string;
	location: Record<string, any> | null;
	geom: string | null;
	createdAt: string;
	updatedAt: string;
	vendor: Vendor;
}

interface Section {
	id: string;
	name: string;
	details: string;
	branchId: string;
	createdAt: string;
	updatedAt: string;
	branch: Branch;
}

interface Industry {
	id: string;
	name: string;
	details: string;
	image: AttachmentContract | null;
	createdAt: string;
	updatedAt: string;
}

interface Task {
	id: string;
	name: string;
	slug: string;
	details: string;
	image: AttachmentContract | null;
	createdAt: string;
	updatedAt: string;

	services: Service[];
}

interface Service {
	id: string;
	name: string;
	slug: string;
	details: string;
	image: AttachmentContract | null;
	taskId: string;
	task: Task;
	createdAt: string;
	updatedAt: string;
}

interface ProductType {
	id: string;
	name: string;
	details: string;
	serviceId: string;
	image: AttachmentContract | null;
	createdAt: string;
	updatedAt: string;

	service: Service;
}

interface ProductCategory {
	id: string;
	name: string;
	details: string;
	image: AttachmentContract | null;
	industryId: string;
	industry: Industry;
	createdAt: string;
	updatedAt: string;
}

interface Product {
	id: string;
	name: string;
	details: string;
	image: AttachmentContract | null;
	price: number;
	discounted: number;
	unit: string;
	sku: string;
	active: boolean;
	featured: boolean;
	vendorId: string;
	vendor: Vendor;
	productCategoryId: string;
	meta: Record<string, any>;
	createdAt: string;
	updatedAt: string;
	category: ProductCategory;
}

interface OrderItem extends Product {
	quantity: number;
	meta: Record<string, any>;
}

interface Order {
	id: string;
	userId: string;
	vendorId: string;
	branchId: string;
	sectionId: string;
	staffId: string;
	lotId: string;
	status: string;
	action: string;
	type: string;
	delivery: string;
	ref: string;
	meta: Record<string, any>;
	total: number;
	createdAt: string;
	updatedAt: string;

	customer: User;
	staff: User;
	section: Section;
	vendor: Vendor;

	items: OrderItem[];
	invoices: Invoice[];
}

interface Lead {
	id: string;
	name: string;
	details: string;
	image: AttachmentContract | null;
	price: number;
	discounted: number;
	active: boolean;
	featured: boolean;
	maxClaim: number;
	vendorId: string;
	vendor: Vendor;
	categoryId: string;
	category: Category;
	startAt: string;
	endAt: string;
	createdAt: string;
	updatedAt: string;
}

interface ProductCreate extends Omit<Product, "image" | "startAt" | "endAt"> {
	image: File | null;
	startAt: Date;
	endAt: Date;
}

interface Message {
	id: string;
	userId: string;
	branchId: string;
	templateId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

interface Payment {
	id: string;
	amount: number;
	ref: string;
	invouceId: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

interface Claim {
	id: string;
	productId: string;
	userId: string;
	status: string;
	user: User;
	product: Product;
}

interface PaginatedData<M> {
	meta: PaginationMeta;
	data: M[];
}
