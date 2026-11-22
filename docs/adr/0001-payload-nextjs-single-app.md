# 0001: Payload CMS in a single Next.js app, with Stripe Checkout

Date: 2026-11-22 · Status: accepted

## Context

Phase 1 adds paid meal-prep ordering (Meals with Options and Add-ons, discounted Packs, fresh local delivery) to a small Vite + React site on Vercel. Staff need an admin dashboard for Orders, the menu and prices, and we don't want to build one. Payment must go through Stripe's hosted Checkout page.

Research (branch `research/dashboard-options`) found that no open-source commerce engine (Medusa, Saleor, Vendure, Payload's e-commerce plugin) supports Stripe hosted Checkout, none models Packs natively, and Medusa, Saleor and Vendure need always-on servers. Shopify covers the most out of the box but replaces Stripe Checkout, costs more, and is the competitor's platform.

## Decision

Use **Payload CMS** as the admin, with our own collections, inside **one Next.js app** that also serves the shop. The data lives in **Neon Postgres** and the app is hosted on **Vercel**. Stripe Checkout Sessions are created on the server from prices in the database, and a verified Stripe webhook marks Orders as paid.

## Consequences

- The current Vite pages must be moved to Next.js before any ordering work. This is a one-off job (about 1,500 lines).
- We build the Pack, pricing and order logic ourselves, which is where the product differs from the competitor anyway.
- Payload owns the database schema, so leaving Payload later means a data migration.
- Payload has been owned by Figma since June 2025 and is committed to staying open source. This is a vendor risk to watch.
- Running cost stays low: Vercel Pro plus Neon's free or low tier. No extra servers.
