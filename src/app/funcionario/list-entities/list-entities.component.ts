// front/malvader-frontend/src/app/funcionario/list-entities/list-entities.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { ContaService } from '../../services/conta.service';

@Component({
  selector: 'app-list-entities',
  templateUrl: './list-entities.component.html',
  styleUrls: ['./list-entities.component.scss']
})
export class ListEntitiesComponent implements OnInit {
  @Input() type: 'usuarios' | 'contas' = 'usuarios'; // Tipo de listagem (input property)
  entities: any[] = [];
  errorMessage: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private contaService: ContaService
  ) { }

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(): void {
    this.errorMessage = '';
    if (this.type === 'usuarios') {
      this.usuarioService.getAllUsuarios().subscribe({
        next: (data) => {
          this.entities = data;
          console.log('Usuários carregados:', this.entities);
        },
        error: (error) => {
          console.error('Erro ao carregar usuários:', error);
          this.errorMessage = 'Erro ao carregar usuários. Tente novamente.';
        }
      });
    } else if (this.type === 'contas') {
      this.contaService.getAllContas().subscribe({
        next: (data) => {
          this.entities = data;
          console.log('Contas carregadas:', this.entities);
        },
        error: (error) => {
          console.error('Erro ao carregar contas:', error);
          this.errorMessage = 'Erro ao carregar contas. Tente novamente.';
        }
      });
    }
  }
}