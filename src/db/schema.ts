import {
	pgTable,
	text,
	timestamp,
	boolean,
	uuid,
	doublePrecision,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("emailVerified").notNull(),
	image: text("image"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expiresAt").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull(),
	ipAddress: text("ipAddress"),
	userAgent: text("userAgent"),
	userId: text("userId").notNull().references(() => user.id)
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("accountId").notNull(),
	providerId: text("providerId").notNull(),
	userId: text("userId").notNull().references(() => user.id),
	accessToken: text("accessToken"),
	refreshToken: text("refreshToken"),
	idToken: text("idToken"),
	accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
	refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("createdAt").notNull(),
	updatedAt: timestamp("updatedAt").notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expiresAt").notNull(),
	createdAt: timestamp("createdAt"),
	updatedAt: timestamp("updatedAt")
});

export const mosques = pgTable("mosques", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	type: text("type").notNull(),
	latitude: doublePrecision("latitude").notNull(),
	longitude: doublePrecision("longitude").notNull(),
	address: text("address"),
	website: text("website"),
	contact: text("contact"),
	hasWuduArea: boolean("has_wudu_area").notNull().default(false),
	hasSeparateMenWomen: boolean("has_separate_men_women").notNull().default(false),
	hasParking: boolean("has_parking").notNull().default(false),
	isWheelchairAccessible: boolean("is_wheelchair_accessible").notNull().default(false),
	hasRestrooms: boolean("has_restrooms").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	createdById: text("created_by_id")
		.notNull()
		.references(() => user.id, { onDelete: "set null" }),
});

export const mosquePhotos = pgTable("mosque_photos", {
	id: uuid("id").defaultRandom().primaryKey(),
	mosqueId: uuid("mosque_id")
		.notNull()
		.references(() => mosques.id, { onDelete: "cascade" }),
	url: text("url").notNull(),
	uploadedById: text("uploaded_by_id")
		.notNull()
		.references(() => user.id, { onDelete: "set null" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
