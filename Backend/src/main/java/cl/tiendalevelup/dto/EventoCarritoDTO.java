package cl.tiendalevelup.dto;

import java.io.Serializable;

public class EventoCarritoDTO implements Serializable {
    private String eventoId;
    private String tipoEvento; // "ITEM_AGREGADO", "ITEM_ELIMINADO"
    private String timestamp;
    private Long usuarioId;
    private String emailUsuario;
    private ItemCarritoDTO item;

    public EventoCarritoDTO() {}

    // Getters y Setters
    public String getEventoId() { return eventoId; }
    public void setEventoId(String eventoId) { this.eventoId = eventoId; }
    public String getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(String tipoEvento) { this.tipoEvento = tipoEvento; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getEmailUsuario() { return emailUsuario; }
    public void setEmailUsuario(String emailUsuario) { this.emailUsuario = emailUsuario; }
    public ItemCarritoDTO getItem() { return item; }
    public void setItem(ItemCarritoDTO item) { this.item = item; }

    public static class ItemCarritoDTO implements Serializable {
        private String productoId;
        private String nombre;
        private Double precio;
        private Integer cantidad;

        public ItemCarritoDTO() {}

        public String getProductoId() { return productoId; }
        public void setProductoId(String productoId) { this.productoId = productoId; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public Double getPrecio() { return precio; }
        public void setPrecio(Double precio) { this.precio = precio; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    }
}