using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixHomepageThemeModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerImageUrl",
                table: "HomepageThemes");

            migrationBuilder.DropColumn(
                name: "VideoCoverImageUrl",
                table: "HomepageThemes");

            migrationBuilder.RenameColumn(
                name: "HeroImageUrl",
                table: "HomepageThemes",
                newName: "KitchenMedia");

            migrationBuilder.AddColumn<string>(
                name: "HeroSliderImages",
                table: "HomepageThemes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ShowCategories",
                table: "HomepageThemes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowFeatured",
                table: "HomepageThemes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowHeroSlider",
                table: "HomepageThemes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowKitchen",
                table: "HomepageThemes",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HeroSliderImages",
                table: "HomepageThemes");

            migrationBuilder.DropColumn(
                name: "ShowCategories",
                table: "HomepageThemes");

            migrationBuilder.DropColumn(
                name: "ShowFeatured",
                table: "HomepageThemes");

            migrationBuilder.DropColumn(
                name: "ShowHeroSlider",
                table: "HomepageThemes");

            migrationBuilder.DropColumn(
                name: "ShowKitchen",
                table: "HomepageThemes");

            migrationBuilder.RenameColumn(
                name: "KitchenMedia",
                table: "HomepageThemes",
                newName: "HeroImageUrl");

            migrationBuilder.AddColumn<string>(
                name: "BannerImageUrl",
                table: "HomepageThemes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoCoverImageUrl",
                table: "HomepageThemes",
                type: "text",
                nullable: true);
        }
    }
}
