# Leryn POS Architecture Blueprint

## Overview
Leryn POS is a point of sale system for restaurants, built with Next.js (App Router), TailwindCSS, and MongoDB via Mongoose. It facilitates order management, branch operations, recipe configuration, inventory tracking, role-based access control, and comprehensive dashboard reporting.

## Project Outline
- **Authentication**: Custom login implementation for both general access and admin dashboard using JWT cookies (`session_token`, `admin_session_token`).
- **Dashboard Structure**: Grid layout on `/admin-dashboard` pointing to various management modules.
- **Modules Implemented**:
  - **Manage Branch**: Create and view branches, associate inventory setups.
  - **Manage Role & Permission**: RBAC system dynamically mapping roles to available permissions.
  - **Manage Staff**: Assign users/staff to specific branches and roles.
  - **Manage Inventory**: Track raw materials and stock levels (in/out) per branch.
  - **Manage Recipe**: Create recipes consisting of required inventory items and quantities per branch.
  - **Manage Menu**: Bind recipes to sellable menu items within a specific branch and designate their price.
  - **Manage Additional Menu**: Bind topping/extra options to an existing menu inside a specific branch with designated price.
  - **Manage Table**: Define branch areas/sections and manage table capacity layout using an interactive drag-and-drop floorplan canvas.

## Current Change Plan & Steps (Manage Table feature)
- `[x]` Implement `model/table-area.js` and `model/table.js`
- `[x]` Implement `app/actions/manage-table.ts` 
- `[x]` Implement `/admin-dashboard/manage-table/page.tsx`
- `[x]` Validate the user experience and ensure code quality aligns with existing codebase standards.
