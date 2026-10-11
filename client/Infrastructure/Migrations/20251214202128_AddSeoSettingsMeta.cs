using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSeoSettingsMeta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsIndexable",
                table: "SeoSettings");

            migrationBuilder.RenameColumn(
                name: "SiteTitle",
                table: "SeoSettings",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "MetaDescription",
                table: "SeoSettings",
                newName: "PageType");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "SeoSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EntityId",
                table: "SeoSettings",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "SeoSettings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "SeoSettings");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "SeoSettings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "SeoSettings");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "SeoSettings",
                newName: "SiteTitle");

            migrationBuilder.RenameColumn(
                name: "PageType",
                table: "SeoSettings",
                newName: "MetaDescription");

            migrationBuilder.AddColumn<bool>(
                name: "IsIndexable",
                table: "SeoSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
