"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryBudgetController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const category_budget_service_1 = require("./category-budget.service");
const upsert_budget_dto_1 = require("./dto/upsert-budget.dto");
let CategoryBudgetController = class CategoryBudgetController {
    categoryBudgetService;
    constructor(categoryBudgetService) {
        this.categoryBudgetService = categoryBudgetService;
    }
    findAll(user) {
        return this.categoryBudgetService.findAll(user.id);
    }
    upsert(user, dto) {
        return this.categoryBudgetService.upsert(user.id, dto.categoryId, dto.amount);
    }
    remove(user, categoryId) {
        return this.categoryBudgetService.remove(user.id, categoryId);
    }
};
exports.CategoryBudgetController = CategoryBudgetController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CategoryBudgetController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upsert_budget_dto_1.UpsertBudgetDto]),
    __metadata("design:returntype", void 0)
], CategoryBudgetController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':categoryId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CategoryBudgetController.prototype, "remove", null);
exports.CategoryBudgetController = CategoryBudgetController = __decorate([
    (0, common_1.Controller)('category-budgets'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [category_budget_service_1.CategoryBudgetService])
], CategoryBudgetController);
//# sourceMappingURL=category-budget.controller.js.map