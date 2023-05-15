# 第Ⅲ部 お手軽にアプリ開発ができるNestJSの始め方

## 目次
- [第1章　はじめに]()
- [第2章　NestJSとは]()
- [第3章　環境構築]()
- [第4章　CRUD作成]()
- [第5章　おわりに]()
- [参考文献]()

## 第１章　はじめに
 こんにちは。Webエンジニアの光岡です。現在、大学院生をしながら、学生エンジニアインターンとして、アプリケーション開発に携わっています。これまでRuby on Rails, Goでのバックエンド開発をメインに取り組んできました。一時、AWS, Terraformなども触りながらインフラ開発に携わったりもしてきました。
 
 そんな私ですが、ずっと気になっていた言語・フレームワークがあります。それはTypeScriptとNestJSです。今後Webフロントエンド開発にも力を入れていきたいと考えています。そうすると必然的にJavaScriptを扱うことになります。また、現在は型付きのTypeScriptを採用されているところが多いと思います。フロントエンドと同じ言語でバックエンドも開発できたらいいのになと思っていたところ、NestJSというフレームワークを知り、興味を持ちました。
 
 そこで今回、NestJSを使った基本のCRUD（Create: データの作成、Read: データの読み取り、Update: データの更新、Delete: データの削除）サンプルアプリケーションの作成方法と、実際に試してみて感じたこと・詰まったエラーなどをご紹介したいと思います。
 
また、対象読者は下記の通りです。

1. JavaScriptを利用したことがある方
2. バックエンド開発を経験したことがある方（実務経験は問いません）
3. 型付き言語に少しでも触れたことがある方（今回TypeScriptを利用しています）

万が一該当しなくても、NestJSの書き方は直感的なため全体の流れは分かりやすいと思います！

また、今回はNestJSに加え、Prisma、GraphQLを利用しています。

Prismaとは、Node.jsとTypeScriptのためのORMのことです。RailsだとActiveRecordにあたると思います。ORMの恩恵を受けてきた私は、迷わずPrismaの導入を採用しました！

GraphQLは、Web APIのためのクエリ言語およびランタイムシステムを指します。REST APIに比べ、必要なデータのみを取得できるため、通信量が少なくなることや、クライアントが必要とするデータの構造を自由に定義できるため、柔軟性が高い特徴があります。
 
## 第2章　 NestJSとは
 NestJSの詳しい特徴などは、[NestJSの公式ドキュメント](https://docs.nestjs.com/)を確認していただければと思いますが、いくつか抜粋すると下記内容になります。
 
1. Node.jsサーバーサイドアプリケーションを構築するためのフレームワーク
2. TypeScriptで構築されている
3. 堅牢なHTTPサーバーフレームワークである[Express](https://expressjs.com/)をデフォルトで利用
4. [Fastify](https://www.fastify.io/)を使用することが可能

Expressは、Node.jsのフレームワークの1つであり、HTTPリクエストとレスポンスを処理するためのシンプルなルーティングやミドルウェア機能等を提供しています。

Fastifyも同様に、Node.jsのフレームワークの1つですが、Expressに比べ、処理速度が速い特徴があります。

今回は、よりシンプルなExpressを利用しています。

 
## 第3章　 環境構築

今回利用したnpmのバージョンは`8.19.2`です。

```terminal=
$ npm -v
8.19.2
```

### 3.1 NestJS
 早速触っていきたいと思います。
 
まずは`Nest CLI`をインストールします。

```terninal=
$ npm i -g @nestjs/cli
```

次に、`Nest CLI`でアプリケーションの雛形を作成します。

今回、アプリケーション名は`sample-app-nestjs`としています。

また、TypeScriptのstrict modeにしたかったため、`—strict`フラグを追加しています。

```terminal=
$ nest new sample-apps-nestjs --strict
```

どのパッケージマネージャーを利用するか聞かれます。今回はnpmを選択しています。

```terminal=
? Which package manager would you ❤️  to use? (Use arrow keys)
❯ npm
  yarn
  pnpm
```

アプリケーションの雛形ができたら、ひとまず起動してみましょう。


```terminal=
$ cd sample-app-nestjs

$ npm run start:dev
```

[Uploading file..._wjpqfs6cj]()

`:dev`をつけておくことで、ファイルの変更が即時反映されます！

### 3.2 DB

今回はDockerを使って、PostgreSQLを利用することにしました。ここはサクッと済ませたいので、この後利用するPrismaも参考になった[Create a PostgreSQL instance](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0#create-a-postgresql-instance)に沿って、DBを構築したいと思います。


```terminal=
$ touch docker-compose.yml
```

```terminal=
# docker-compose.yml

version: '3.8'
services:

  postgres:
    image: postgres:13.5
    restart: always
    environment:
      - POSTGRES_USER=myuser
      - POSTGRES_PASSWORD=mypassword
    volumes:
      - postgres:/var/lib/postgresql/data
    ports:
      - '5432:5432'

volumes:
  postgres:
```

では、実際に立ち上げてみましょう！


```terminal=
$ docker compose up
```

一応Dockerコンテナに入って、無事立ち上がっているか確認してみましょう。

```terminal=
$ docker exec -it <container_name> bash

// 私の場合
$ docker exec -it sample-app-nestjs-postgres-1 bash
```

私はいつもMySQLを利用することが多く、PostgreSQLのコマンドを把握していなかったので、下記記事を参考にDBが作成されているか確認しました。


- [Docker上のPostgreSQLコンテナの中に入って中身を見る手順とコマンドの詳細を実例で解説｜psqlで対話モードにならない時の対処法（DBやテーブル、主なSQL一覧）](https://prograshi.com/platform/docker/execute-psql-in-postgresql-in-docker/)
- [[PostgreSQL] よく使うコマンドまとめ](https://dev.classmethod.jp/articles/postgresql-organize-command/)

```terminal=
$ psql -U myuser
psql (13.5 (Debian 13.5-1.pgdg110+1))
Type "help" for help.

myuser=# 

myuser=# \l
                              List of databases
   Name    | Owner  | Encoding |  Collate   |   Ctype    | Access privileges 
-----------+--------+----------+------------+------------+-------------------
 myuser    | myuser | UTF8     | en_US.utf8 | en_US.utf8 | 
 postgres  | myuser | UTF8     | en_US.utf8 | en_US.utf8 | 
 template0 | myuser | UTF8     | en_US.utf8 | en_US.utf8 | =c/myuser        +
           |        |          |            |            | myuser=CTc/myuser
 template1 | myuser | UTF8     | en_US.utf8 | en_US.utf8 | =c/myuser        +
           |        |          |            |            | myuser=CTc/myuser
(4 rows)
```

`docker-compose.yml`で指定したDB名の`postgres`が作成されていることが確認できました！



### 3.3 Prisma

次は[Prisma](https://www.prisma.io/)を導入していきます。

セットアップ方法に関しては、[Set up Prisma](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0#set-up-prisma)を参考にしました。

```terminal=
$ npm install -D prisma

$ npx prisma init
```

`.env`ファイルと`prisma/schema.prisma`ファイルが作成されると思います。DBコンテナと接続するために書き換えます。

```terminal=
// .env

DATABASE_URL="postgres://myuser:mypassword@localhost:5432/postgres"
```
 
では、試しに1つテーブルを作成してみましょう。今回はTaskテーブルを作成してみます。

```sql:prisma/schema.prisma
// prisma/schema.prisma

model Task {
  id Int @id @default(autoincrement())
  name String
  description String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

いくつか便利なオプションがあったので紹介します。

- `@id`: PRIMARY KEYの指定
- `@default(autoincrement())`: 自動的にインクリメントされ、新しく作成されたレコードに割り当てる
- `?`: フィールドをオプションにする
- `@updatedAt`: 変更されるたびに、自動的に現在のタイムスタンプでフィールドを更新


早速反映してみましょう

```terminal=
npx prisma migrate dev --name "task"
```

コマンド実行後、私は下記エラーに遭遇しました。

```terminal=
$ npx prisma migrate dev --name "task"
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "localhost:5432"

Error: P1001: Can't reach database server at `localhost`:`5432`

Please make sure your database server is running at `localhost`:`5432`.
```

原因は単純で、Dockerコンテナが立ち上がっていないことでした。
単純なミスですが、もし数日に分けて試してくださっている方がいたら、コンテナを立ち上げ忘れて、同様のエラーに遭遇するかもしれないです。

気を取り直して、コンテナを立ち上げてから再度実行すると、`prisma/migrations`が作成され、migration.sqlが作成されると思います。





<!-- Adminerで確認すると下記画像のようになっていると思います
![](https://i.imgur.com/5bpiXWU.png) -->




では、再度Dockerコンテナに入り、テーブル作成ができているか確認してみましょう。

```terminal=
$ docker exec -it <container_name> bash

$ psql -U myuser
psql (13.5 (Debian 13.5-1.pgdg110+1))
Type "help" for help.

myuser=# 


// DBの指定
myuser=# \c postgres
You are now connected to database "postgres" as user "myuser".
postgres=# 


// テーブル一覧
postgres=# \dt
              List of relations
 Schema |        Name        | Type  | Owner  
--------+--------------------+-------+--------
 public | Task               | table | myuser
 public | _prisma_migrations | table | myuser
(2 rows)
```


このタイミングで色々調べていた私は、便利なツールを見つけてしまいました。それはPrisma Studioです。

[Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio)は、DB内のデータを確認・操作出来るビジュアルエディターです。

使い方はとても簡単です。下記コマンドを叩き、`localhost:5555`にアクセスしてみましょう。

```terminal=
npx prisma studio
```

GUIからレコードの作成などが可能です。試しに1つレコードを作成してみた結果が下記画像です。

![](3-3-1.png)
<figcaption style="text-align: center;">図3.3.1: Prisma Studioによるレコード作成の実行結果</figcaption>



次にPrisma Serviceを導入します。
Prisma Serviceとは、Prismaの機能のうち、ORM（Object-Relational Mapping）とマイグレーションに関連する機能を提供しています。そして、Prisma ClientがPrisma Serviceが提供する関数を使用して、データベースへのアクセスや操作を行います。

下記コマンドを叩いてみてください

```
$ npx nest generate module prisma
$ npx nest generate service prisma
```

複数のファイルが新規作成されたと思うので、必要なコードを追加していきます。

```typescript=
// src/prisma/prisma.service.ts

import { INestApplication, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

```typescript=
// src/prisma/prisma.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```


### GraphQL

次にGraphQLの導入です。
私は今年に入ってからGraphQLを使い出したのですが、もっと理解度を深めたいと思い、今回の開発でも利用したいと思います。

下記記事を参考に進めました。

- [Harnessing the power of TypeScript & GraphQL](https://docs.nestjs.com/graphql/quick-start)
- [TypeScript + Nestjs + Prisma でGraphQLサーバー構築](https://zenn.dev/kenghaya/articles/b4e41599d5276c)
- [Ultimate Guide: How to use Prisma with NestJS](https://www.tomray.dev/nestjs-prisma)

まずは下記コマンドを叩いてインストールしましょう

```
$ npm i @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

次に、`src/app.module.ts`の内容を書き換えます。

```typescript=
// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
```

ここで私は、下記エラーに遭遇しました。

```terminal=
GraphQLError: Query root type must be provided...
```

[GraphQL in NestJS with Prisma](https://www.tomray.dev/nestjs-prisma#graphql-in-nestjs-with-prisma)によると、少なくとも1つResolverというもの（後述）を用意する必要があるためです。一旦無視して、残りの設定を進めたいと思います。


最後に、[Using the CLI plugin](https://docs.nestjs.com/graphql/cli-plugin#using-the-cli-plugin)を参考に、プラグインを有効にしておきます。

```terminal=
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": ["@nestjs/graphql"]
  }
}

```




## 第4章　 CRUD作成

ここから、基本のCRUD（Create, Read, Update, Delete）機能を実装していきます！


まずは、Create, Readの作成です
`src/task/task.model.ts`を作成します。

```typescript=
// src/task/task.model.ts

import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Task {
    @Field(() => ID)
    id: number;
    name: string;
    description?: string
    createdAt: Date
    updatedAt: Date
}
```

次に、`src/task/task.service.ts`を作成します。
```typescript=
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Task } from 'src/task/task.model';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => Task)
export class TaskResolver {
    constructor(private prisma: PrismaService) {}

    @Query(() => [Task])
    async tasks() {
        return this.prisma.task.findMany();
    }

    @Mutation(() => Task)
    async createTask(
        @Args('name') name: string,
        @Args('description') description: string,
    ) {
        return this.prisma.task.create({
            data: { name, description }
        });
    }
}
```

最後に、`src/app.module.ts`の`providers`に`TaskResolver`を追加してください

```typescript=
// src/app.module.ts

.
.
  providers: [AppService, PrismaService, TaskResolver],
})
export class AppModule {}
```

ここで、`npm run start:dev`を叩いて、動作確認してみましょう！

私はこのタイミングで、下記エラーに遭遇しました。

```terminal=
src/app.module.ts:14:23 - error TS2304: Cannot find name 'join'.

14       autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
                         ~~~~

[8:10:46 PM] Found 1 error. Watching for file changes.
```

原因は、`import { join } from 'path';`が必要でした。

自動でimport文を記述してくれるようなVSCodeの拡張機能などが動作していれば問題ないと思いますが、私の場合は、この時補完が効いておらず、[公式ドキュメントの下記コード](https://docs.nestjs.com/graphql/quick-start#code-first)だけを見て詰まっていました。

```typescript=
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),
```


また、今回の場合は`join`がなくても動作します。

```typescript=
// src/app.module.ts
.
.
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: (process.cwd(), 'src/schema.gql'),'src/schema.gql'),
      .
      .
```

`src/app.module.ts`を保存した際に、'src/schema.gql'が自動で作成されます。
私の場合、これで`npm run start:dev`が起動できました。

GraphQLを利用しているときは、[GraphQL Playground](https://docs.nestjs.com/graphql/quick-start#graphql-playground)が利用できるので使ってみましょう！

`localhost:3000/graphql`にアクセスしてください。
最初にQueryを実行してみましょう。

画面左に下記クエリを入力し、実行してみてください。
クエリの書き方は、[3. Write your first query](https://www.apollographql.com/docs/kotlin/v2/tutorial/03-write-your-first-query)を参考にしました。

```graphql=
query taskList {
  tasks {
    id
    name
    description
  }
}
```


![](4-1.png)
<figcaption style="text-align: center;">図4.1: taskListの実行結果</figcaption>


無事にTaskを取得できました！


次はTaskを作成してみましょう。

画面左に下記クエリを入力し、実行してみてください。
Mutaionのクエリは、記事によって少し異なっていたのですが、今回は[Query の定義](https://lessons-laravel-graphql.d3muvkqb3ogkfv.amplifyapp.com/04.mutations.html#query-%E3%81%AE%E5%AE%9A%E7%BE%A9)を参考にしました。

```graphql=
mutation{
  createTask(name: "testB", description: "From GraphQL Playground"){
    id
    name
    description
  }
}
```

![](4-2.png)
<figcaption style="text-align: center;">図4.2: createTaskの実行結果</figcaption>

本当に作成できているか、最初に実行したクエリを再度実行してみてください。

![](4-3.png)
<figcaption style="text-align: center;">図4.3: createTaskの実行後のtaskListの実行結果</figcaption>


ちゃんと作成されていることが確認できました！


このタイミングでファイルをもう少し分割してみたいと思います。

色々な記事を見ていたところ、GraphQLのResolverとserviceを別々のファイルで管理している方法をよく見たので、修正してみます。

また、GraphQLのResolverとServiceに関して、

Resolverは、GraphQLのクエリに対してデータを提供するための関数を指します。Resolver自体はデータベースアクセスや外部API呼び出しを直接行うわけではありません

対して、Serviceはアプリケーション内で複数の場所で使用されるビジネスロジックやデータアクセスをカプセル化するためのコンポーネントを指します。Serviceは、Resolverがデータを取得するために使用するメソッドを提供し、データベースとの通信を処理し、Resolverが必要とするデータを取得するためのインターフェースを提供する箇所になります。

現時点では、`src/task/task.service.ts`にResolverも含まれている状態です。`src/task/task.resolver.ts`を作成し、移管していきましょう。

```typescript=
// src/task/task.resolver.ts

import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Task } from './task.model';
import { TaskService } from './task.service';

@Resolver(() => Task)
export class TaskResolver {
    constructor(private taskService: TaskService){}

    @Query(() => [Task])
    async tasks(): Promise<Task[]> {
        return this.taskService.taskList();
    }

    @Mutation(() => Task)
    async createTask(@Args('data') data: Task): Promise<Task> {
        return this.taskService.createTask(data);
    }
}
```

`src/task/task.service.ts`をServiceのみに修正します。

```typescript=
// src/task/task.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task } from './task.model';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) {}

    async taskList(): Promise<Task[]> {
        const tasks = await this.prisma.task.findMany();
        return tasks.map((task: PrismaTask) => ({ ...task }));
    }

    async createTask(data: Task): Promise<Task> {
        const createdTask = await this.prisma.task.create({ data })
        return { ...createdTask }
    }
}
```

また、Moduleにまとめた方が良さそうだということがわかり、`src/app.module.ts`を追加で作成しました。

```typescript=
// src/task/task.module.ts

import { Module } from "@nestjs/common";
import { TaskResolver } from "./task.resolver";
import { TaskService } from "./task.service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    providers: [TaskResolver, TaskService, PrismaService]
})
export class TaskModule {}
```

最後に、`src/app.module.ts`を修正します。

```typescript=

import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaModule } from './prisma/prisma.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: (process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    PrismaModule,
    TaskModule,
  ],
})
export class AppModule {}
```

この状態で、私のターミナルには2つのエラーが表示されました。

1つ目は下記エラーです。

```terminal=
Argument of type '(task: Task) => { id: number; name: string; description?: string | undefined; createdAt: Date; updatedAt: Date; }' is not assignable to parameter of type '(value: Task, index: number, array: Task[]) => { id: number; name: string; description?: string | undefined; createdAt: Date; updatedAt: Date; }'.
...
```

こちらに関しては、Prismaで自動生成されたTaskを使ってあげることで解消できました。

```typescript=

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task as PrismaTask } from '@prisma/client';
import { Task } from './task.model';

@Injectable()
.
.
```

2つ目は下記エラーです。

```terminal=
Type '{ id: number; name: string; description: string | null; createdAt: Date; updatedAt: Date; }' is not assignable to type 'Task'.
  Types of property 'description' are incompatible.
    Type 'string | null' is not assignable to type 'string | undefined'.

17         return { ...createdTask }
.
.
```

原因は、Taskクラスのdescriptionプロパティの型が、`（string | undefined）`であるのに対し、Prismaから取得したPrismaTaskオブジェクトのdescriptionプロパティは、`（string | null）`であることでした。nullの場合エラーになってしまうので、`undefined`に変換する必要があります。

修正したコードが下記の通りです。

```typescript=
// src/task/task.service.ts
.
.
    async taskList(): Promise<Task[]> {
        const tasks = await this.prisma.task.findMany();
        return tasks.map((task: PrismaTask) => ({ 
            ...task,
            description: task.description ?? undefined,
        }));
    }

    async createTask(data: Task): Promise<Task> {
        const createdTask = await this.prisma.task.create({ data })
        return { 
            ...createdTask, 
            description: createdTask.description ?? undefined
        }
    }
}
```

この状態で、新たなエラーが発生しました。

```terminal=
throw new cannot_determine_input_type_error_1.CannotDetermineInputTypeError(hostType, typeRef);
                      ^
Error: Cannot determine a GraphQL input type ("Task") for the "data". Make sure your class is decorated with an appropriate decorator.
.
.
```
dataに対してGraphQLのInputTypeが指定されていないためで、`@InputType()`を使って、GraphQLのInputTypeのTaskクラスを作成する必要がありました。

modelファイルに`InputTask`を作成します。
```typescript=
// src/task/task.model.ts
.
.
@InputType()
export class TaskInput {
    @Field()
    name: string;
    description?: string;
    createdAt: Date
    updatedAt: Date
}
```

resolver, serviceで、`InputTask`を利用します。

```typescript=
// src/task/task.resolver.ts

import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TaskService } from './task.service';
import { Task, TaskInput } from './task.model';

.
.

    @Mutation(() => Task)
    async createTask(@Args('data') data: TaskInput): Promise<Task> {
        return this.taskService.createTask(data);
    }
}
```

```typescript=
// src/task/task.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task as PrismaTask } from '@prisma/client';
import { Task, TaskInput } from './task.model';

.
.

    async createTask(data: TaskInput): Promise<Task> {
        const createdTask = await this.prisma.task.create({ data })
        return { 
            ...createdTask, 
            description: createdTask.description ?? undefined
        }
    }
}
```

ここで、無事先ほどまでと同じ動作ができるようになったと思います！



では、Update, Deleteを作成してみましょう。

```typescript=
// src/task/task.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task as PrismaTask } from '@prisma/client';
import { Task, TaskInput } from './task.model';

@Injectable()
export class TaskService {
    constructor(private prisma: PrismaService) {}

    .
    .

    async updateTask(id: number, data: TaskInput): Promise<Task> {
        const updatedTask = await this.prisma.task.update({
            where: { id },
            data: { ...data, },
        });
        return {
            ...updatedTask,
            description: updatedTask.description ?? undefined
        }
    }

    async deleteTask(id: number): Promise<Task> {
        const deletedTask = await this.prisma.task.delete({
            where: { id },
        })
        return {
            ...deletedTask,
            description: deletedTask.description ?? undefined
        }
    }
}
```

```typescript=
// src/task/task.resolver.ts

import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { TaskService } from './task.service';
import { Task, TaskInput } from './task.model';

@Resolver(() => Task)
export class TaskResolver {
    constructor(private taskService: TaskService){}

    .
    .

    @Mutation(() => Task)
    async updateTask(
        @Args('id') id: number,
        @Args('data') data: TaskInput,
    ): Promise<Task> {
        return this.taskService.updateTask(id, data);
    }

    @Mutation(() => Task)
    async deleteTask(@Args('id') id: number): Promise<Task> {
        return this.taskService.deleteTask(id);
    }
}
```

では、GraphQL Playgroundで試してみましょう。

updateTaskのサンプルクエリはこちらです。

```graphql=
mutation{
  updateTask(
    id: 1, 
    data: {
      name: "testAA", 
    	description: "Update!",
    }
  ){
    id
    name
    description
  }
}
```

![](4-4.png)
<figcaption style="text-align: center;">図4.4: updateTaskの実行結果</figcaption>

ちゃんとデータが更新されました！

また、先ほど`TaskInput`を導入したことで、createTaskのクエリも修正する必要があります。

```graphql=
mutation{
  createTask(
    data: {
      name: "testC"
    }
  ){
    id
    name
    description
  }
}
```

では最後に、deleteTaskを試してみます。

実行前の状態は図4.5です。

![](4-5.png)
<figcaption style="text-align: center;">図4.5: deleteTask実行前のtaskListの実行結果</figcaption>

クエリはこちらになります。
```graphql=
mutation{
  deleteTask(id: 3){
    id
    name
    description
  }
}
```

![](4-6.png)
<figcaption style="text-align: center;">図4.6: deleteTaskの実行結果</figcaption>


実行後の状態は図4.7です。

![](4-7.png)
<figcaption style="text-align: center;">図4.7: deleteTask実行後のtaskListの実行結果</figcaption>

無事CRUD機能を開発することができました！


## 第5章　おわりに

今回は本当に基本的なCRUDアプリケーションでしたが、Ruby on Railsなどに比べ情報がまだ少ないこともあり、所々詰まりながら開発・執筆を進めました。私が遭遇したエラー含めてご参考になれば幸いです。

## 参考記事
- [Documentation](https://docs.nestjs.com/)
- [Express - Node.js web application framework](https://expressjs.com/)
- [Fastify, Fast and low overhead web framework, for Node.js](https://www.fastify.io/)
- [Building a REST API with NestJS and Prisma](https://www.prisma.io/blog/nestjs-prisma-rest-api-7D056s1BmOL0#create-a-postgresql-instance)
- [Docker上のPostgreSQLコンテナの中に入って中身を見る手順とコマンドの詳細を実例で解説｜psqlで対話モードにならない時の対処法（DBやテーブル、主なSQL一覧）](https://prograshi.com/platform/docker/execute-psql-in-postgresql-in-docker/)
- [[PostgreSQL] よく使うコマンドまとめ](https://dev.classmethod.jp/articles/postgresql-organize-command/)
- [Prisma](https://www.prisma.io/)
- [Prisma Studio](https://www.prisma.io/docs/concepts/components/prisma-studio)
- [Harnessing the power of TypeScript & GraphQL](https://docs.nestjs.com/graphql/quick-start)
- [TypeScript + Nestjs + Prisma でGraphQLサーバー構築](https://zenn.dev/kenghaya/articles/b4e41599d5276c)
- [Ultimate Guide: How to use Prisma with NestJS](https://www.tomray.dev/nestjs-prisma)
- [GraphQL Playground](https://docs.nestjs.com/graphql/quick-start#graphql-playground)
- [Apollo Docs](https://www.apollographql.com/docs/)
- [Laravel GraphQL 開発 入門](https://lessons-laravel-graphql.d3muvkqb3ogkfv.amplifyapp.com/04.mutations.html#query-%E3%81%AE%E5%AE%9A%E7%BE%A9)