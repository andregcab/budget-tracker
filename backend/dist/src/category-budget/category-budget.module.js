"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryBudgetModule = void 0;
const common_1 = require("@nestjs/common");
const category_budget_controller_1 = require("./category-budget.controller");
const category_budget_service_1 = require("./category-budget.service");
let CategoryBudgetModule = class CategoryBudgetModule {
};
exports.CategoryBudgetModule = CategoryBudgetModule;
exports.CategoryBudgetModule = CategoryBudgetModule = __decorate([
    (0, common_1.Module)({
        controllers: [category_budget_controller_1.CategoryBudgetController],
        providers: [category_budget_service_1.CategoryBudgetService],
        exports: [category_budget_service_1.CategoryBudgetService],
    })
], CategoryBudgetModule);
//# sourceMappingURL=category-budget.module.js.map