using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductSeo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Keywords",
                table: "SeoMetas");

            migrationBuilder.AddColumn<string>(
                name: "Canonical",
                table: "SeoMetas",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OgImage",
                table: "SeoMetas",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Canonical",
                table: "SeoMetas");

            migrationBuilder.DropColumn(
                name: "OgImage",
                table: "SeoMetas");

            migrationBuilder.AddColumn<string>(
                name: "Keywords",
                table: "SeoMetas",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
