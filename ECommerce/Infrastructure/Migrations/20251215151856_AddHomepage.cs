using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHomepage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerImageUrl",
                table: "HomepageThemes");

            migrationBuilder.DropColumn(
                name: "VideoCoverImageUrl",
                table: "HomepageThemes");
        }
    }
}
