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
exports.RevenueController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const revenue_service_1 = require("./revenue.service");
const upsert_revenue_dto_1 = require("./dto/upsert-revenue.dto");
let RevenueController = class RevenueController {
    revenueService;
    constructor(revenueService) {
        this.revenueService = revenueService;
    }
    getForMonth(user, year, month) {
        if (!year || !month) {
            return null;
        }
        return this.revenueService.getForMonth(user.id, parseInt(year, 10), parseInt(month, 10));
    }
    upsert(user, dto) {
        return this.revenueService.upsert(user.id, dto);
    }
    remove(user, year, month) {
        return this.revenueService.remove(user.id, parseInt(year, 10), parseInt(month, 10));
    }
};
exports.RevenueController = RevenueController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "getForMonth", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upsert_revenue_dto_1.UpsertRevenueDto]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('year')),
    __param(2, (0, common_1.Query)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], RevenueController.prototype, "remove", null);
exports.RevenueController = RevenueController = __decorate([
    (0, common_1.Controller)('revenue'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [revenue_service_1.RevenueService])
], RevenueController);
//# sourceMappingURL=revenue.controller.js.map