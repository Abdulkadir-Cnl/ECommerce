using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixHomepageTheme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FeaturedProductIds",
                table: "HomepageThemes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HomepageCategoryIds",
                table: "HomepageThemes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HomepageProductIds",
                table: "HomepageThemes",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FeaturedProductIds",
                table: "HomepageThemes");

            migrationBuilder.DropColumn(
                name: "HomepageCategoryIds",
                table: "HomepageThemes");

            migrationBuilder.DropColumn(
                name: "HomepageProductIds",
                table: "HomepageThemes");
        }
    }
}
