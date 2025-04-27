import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Agrega esta importación
import { MatTableModule } from '@angular/material/table';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/interfaces/product';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SaveProductDlgComponent } from '../save-product-dlg/save-product-dlg.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-product-home',
  imports: [
    CommonModule, // Agrega esta línea
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    ReactiveFormsModule
  ],
  templateUrl: './product-home.component.html',
  styleUrl: './product-home.component.scss'
})
export class ProductHomeComponent implements OnInit {
  columns: string[] = ['image', 'name', 'description', 'currency', 'price', 'state', 'action'];
  dataSource: Product[] = [];
  filteredDataSource: Product[] = [];
  
  // Filtros
  filterForm!: FormGroup; // Añadimos el operador ! aquí
  showFilters = false;
  maxPriceValue = 200;

  productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    // Inicializar formulario de filtros
    this.filterForm = this.fb.group({
      name: [''],
      maxPrice: [this.maxPriceValue]
    });
    

    // Suscribirse a cambios en los filtros
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
    
    this.getAll();
  }

  getAll(): void {
    this.productService.getAll().subscribe(res => {
      console.log('Api response:', res.data);
      this.dataSource = res.data;
      this.applyFilters(); // Aplicar filtros iniciales
    });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    const nameFilter = this.filterForm.get('name')?.value?.toLowerCase() || '';
    const maxPriceFilter = this.filterForm.get('maxPrice')?.value || Infinity;

    this.filteredDataSource = this.dataSource.filter(product => {
      // Filtrar por nombre
      const nameMatch = !nameFilter || product.name.toLowerCase().includes(nameFilter);
      
      // Filtrar por precio máximo
      const priceMatch = !maxPriceFilter || product.price <= maxPriceFilter;
      
      return nameMatch && priceMatch;
    });
  }

  resetFilters(): void {
    this.filterForm.patchValue({
      name: '',
      maxPrice: this.maxPriceValue
    });
  }

  openProductDlg(product?: Product): void {
    const dialogRef = this.dialog.open(SaveProductDlgComponent, {
      width: '500px',
      data: product
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.getAll();
      }
    });
  }

  inactiveProduct(id: number) {
    this.productService.inactive(id).subscribe(res => {
      if (res.status) {
        this.getAll();
        this.snackbar.open('Se inactivo el producto', 'Aceptar');
      }
    });
  }
}