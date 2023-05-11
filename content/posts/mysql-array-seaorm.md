---
title: "Storing Array in MySQL with Rust + SeaORM"
date: 2023-01-22T11:25:10+05:30
description: "Represent Array Data in MySQL. Examples of Insertion and Deletion 📊"
draft: false
images:
    - /images/QD5snPl.png
---

# Introduction

MySQL does not support arrays. You must be wondering then how it is still the most popular database that does not have a very essential type of data representation out of the box. I would argue, there are benefits to sticking to basic datatypes and allowing users to represent their data as they wish (such as an array) using constraints. I will demonstrate one such common technique here to store array data with help of Foreign Key Constraint. Usually, this representation is automatically generated in some frameworks, for example, spring boot with the `ddl-auto` option. However, In a rust ecosystem, things are usually verbose, requiring the programmer to know and understand the representation logic and layout of storing data in DB.

For this tutorial, I use Rust and seaorm as Object Relation Mapper. Article Assumes working knowledge of seaorm syntax ([Official SeaORM tutorial](https://www.sea-ql.org/sea-orm-tutorial/)).

# Setup

{{% notice note %}}
[Code on Github](https://github.com/jkotra/seaorm-mysql-array)
{{% /notice %}}

1. Clone `seaorm-mysql-array` (see `note` above)
2. log in to your MySQL console and create a table named `emp_db`

```SQL
CREATE DATABASE emp_db;
```
3. run seaorm migrations. This will drop-create tables.

```sh
DATABASE_URL="mysql://root:password@localhost:3306/emp_db" sea-orm-cli migrate refresh
```

Note: Replace `root` and `password` with your credentials respectively.

now, you can run the program with `cargo run`. Use `--` after to pass arguments to the app.

```
cargo run
```

```
Err! PROGRAM [show|add|rm {id}|clean]
```

App has the following operation:

`add` - Add Employee

`rm {id}` - Remove Employee and his projects who has `{id}`

`clean` - remove all.

`show` - show/find all.

An example interaction output is as follows.

```sh
Employee Name:
Jagadeesh
Employee Projects [seperated by comma(,)]:
Blog, Taxes
constructed object = EmployeeModel { id: 0, name: "Jagadeesh", projects: ["Blog", " Taxes"] }
employee Jagadeesh inserted with id = 24
project Blog inserted with id = 29
project  Taxes inserted with id = 30
=== ALL DATA length=1 ===
EmployeeModel { id: 24, name: "Jagadeesh", projects: ["Blog", " Taxes"] }
=== END ALL DATA ===
```

refer to the [source code](https://github.com/jkotra/seaorm-mysql-array) to peek behind the curtains ;)

## Storing Array Data

First, we need to define our model at the highest level, the one that we are going to use in our rust app. I defined my `Employee` Model as follows:

```rs
#[derive(Debug, Default)]
struct EmployeeModel {
    id: i64,
    name: String,
    projects: Vec<String>,
}
```

A very simple model, with an `id`, `name`, and `projects` he has been assigned to.

In the earlier section, we ran migration on DB. It is nothing but creating the schema. The schema of the table `Employee` can be seen in `migration/src/m_17012023_000001_create_employee.rs`. An excerpt is given below.

{{< highlight rs "hl_lines=9-20, linenos=inline" >}}
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Employee::Table)
                    .col(
                        ColumnDef::new(Employee::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Employee::Name).string().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Employee::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Employee {
    Table,
    Id,
    Name,
}
{{< / highlight >}}

Similarly, We use the `projects` table to store multiple projects assigned to an employee.

{{< highlight rs "hl_lines=21-27 46-48, linenos=inline" >}}
use super::m_17012023_000001_create_employee::Employee;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Projects::Table)
                    .col(
                        ColumnDef::new(Projects::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Projects::EmpId).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk-emp-projects")
                            .from(Projects::Table, Projects::EmpId)
                            .to(Employee::Table, Employee::Id),
                    )
                    .col(ColumnDef::new(Projects::Seq).integer().not_null())
                    .col(ColumnDef::new(Projects::Value).string().not_null())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Projects::Table).to_owned())
            .await
    }
}

#[derive(Iden)]
pub enum Projects {
    Table,
    Id,
    EmpId,
    Seq,
    Value,
}
{{< / highlight >}}


Points to note in the above code:

1. `Employee` has the following columns - `id`, `name`

2. `Projects` has the following columns:

    1. `Id`
    2. `EmpId` - Foreign Key
    3. `Seq` - Sequence / Index
    4. `Value`

3. `Foreign Key` Relation from `Employee::Id` to `Projects::EmpId`. This Constraint makes sure that an employee cannot be deleted while corresponding projects exist, thus ensuring data integrity.

The combination of `Employee` and `Projects` tables gives us `EmployeeModel` that we defined in the beginning.

![ER Diagram](/images/F26YnMf.png)

### Inserting Employee

Take a look at the `insert` fn of our app.

```rs
async fn insert(emp: EmployeeModel) -> Result<(), DbErr> {
    let db = get_db().await?;

    let e = employee::ActiveModel {
        name: ActiveValue::Set(emp.name.clone()),
        ..Default::default()
    };

    let ires = Employee::insert(e).exec(&db).await?;
    println!(
        "employee {} inserted with id = {}",
        emp.name, ires.last_insert_id
    );

    for p in 0..emp.projects.len() {
        let proj_name = emp.projects.clone().get(p).unwrap().to_string();
        if proj_name.len() < 1 {
            continue;
        };
        let i_proj = projects::ActiveModel {
            emp_id: ActiveValue::Set(ires.last_insert_id),
            seq: ActiveValue::Set(p as i32),
            value: ActiveValue::Set(proj_name.clone()),
            ..Default::default()
        };
        let inserted = Projects::insert(i_proj).exec(&db).await.unwrap();
        println!(
            "project {} inserted with id = {}",
            proj_name, inserted.last_insert_id
        );
    }

    Ok(())
}
```

First, we take `EmployeeModel` as an argument, this is generated from user input by `add_emp` fn. Next, We insert `e` into the `employee` table (Needs to be converted to `ActivateModel`).

inserted id is stored as `ires` (`ires.last_insert_id`), This will be used as `EmpId` for projects related to this employee.

A range-based loop is used to insert projects into the `projects` table. 


### Removing Employee

```rs
async fn remove_emp(id: i32) -> Result<(), DbErr> {
    println!("removing employee with id = {}", id);
    let db = get_db().await?;
    Projects::delete_many()
        .filter(projects::Column::EmpId.eq(id))
        .exec(&db)
        .await?;

    Employee::delete_by_id(id).exec(&db).await?;
    Ok(())
}
```

Removing an employee is relatively string forward. Note that we need to remove the projects before the employee itself because of Foreign Key Relationship.

---

# Conclusion

MySQL is the most popular DB for a lot of use cases. Though, it's only a piece of cake if specific language tools are made to deal with complex data structures and data representations not supported by MySQL by default. If you are looking to start a project in rust and are confused as to which DB to choose, the community recommends PostgreSQL (which has native support for array).