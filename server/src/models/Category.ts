import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { IsNotEmpty, IsOptional } from 'class-validator';

@Entity('categories')
@Index(['name'], { unique: true })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  @IsNotEmpty()
  name!: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  description?: string;

  @Column({ type: 'uuid', nullable: true })
  @IsOptional()
  parent_id?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Self-referencing relationship for hierarchical categories
  @ManyToOne(() => Category, category => category.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, category => category.parent)
  children!: Category[];

  // Method to get category path (breadcrumb)
  async getPath(): Promise<string[]> {
    const path: string[] = [this.name];
    let currentCategory: Category | undefined = this;

    while (currentCategory?.parent) {
      currentCategory = currentCategory.parent;
      path.unshift(currentCategory.name);
    }

    return path;
  }

  // Method to check if category is a leaf (no children)
  get isLeaf(): boolean {
    return !this.children || this.children.length === 0;
  }

  // Method to get category level in hierarchy
  get level(): number {
    let level = 0;
    let currentCategory: Category | undefined = this;

    while (currentCategory?.parent) {
      level++;
      currentCategory = currentCategory.parent;
    }

    return level;
  }
} 