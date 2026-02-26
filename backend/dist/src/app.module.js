"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const accounts_module_1 = require("./accounts/accounts.module");
const analytics_module_1 = require("./analytics/analytics.module");
const category_budget_module_1 = require("./category-budget/category-budget.module");
const auth_module_1 = require("./auth/auth.module");
const categories_module_1 = require("./categories/categories.module");
const imports_module_1 = require("./imports/imports.module");
const prisma_module_1 = require("./prisma/prisma.module");
const revenue_module_1 = require("./revenue/revenue.module");
const transactions_module_1 = require("./transactions/transactions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            accounts_module_1.AccountsModule,
            categories_module_1.CategoriesModule,
            category_budget_module_1.CategoryBudgetModule,
            transactions_module_1.TransactionsModule,
            imports_module_1.ImportsModule,
            revenue_module_1.RevenueModule,
            analytics_module_1.AnalyticsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map