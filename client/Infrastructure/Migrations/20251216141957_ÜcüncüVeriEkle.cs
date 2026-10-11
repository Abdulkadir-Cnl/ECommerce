using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ÜcüncüVeriEkle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApiId",
                table: "PaymentMethods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApiKey",
                table: "PaymentMethods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApiSecret",
                table: "PaymentMethods",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsTestMode",
                table: "PaymentMethods",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApiId",
                table: "PaymentMethods");

            migrationBuilder.DropColumn(
                name: "ApiKey",
                table: "PaymentMethods");

            migrationBuilder.DropColumn(
                name: "ApiSecret",
                table: "PaymentMethods");

            migrationBuilder.DropColumn(
                name: "IsTestMode",
                table: "PaymentMethods");
        }
    }
}
