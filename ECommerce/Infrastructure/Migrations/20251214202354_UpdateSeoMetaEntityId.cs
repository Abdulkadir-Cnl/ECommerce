using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSeoMetaEntityId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PageId",
                table: "SeoMetas",
                newName: "EntityId");

            migrationBuilder.AddColumn<string>(
                name: "Keywords",
                table: "SeoMetas",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Keywords",
                table: "SeoMetas");

            migrationBuilder.RenameColumn(
                name: "EntityId",
                table: "SeoMetas",
                newName: "PageId");
        }
    }
}
