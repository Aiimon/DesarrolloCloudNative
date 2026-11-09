package cl.tiendalevelup.dto;

public class AlertaBoletaDto {
    private Long boletaId;
    private Double total;
    private String usuarioEmail;
    private String mensaje;
    private String severidad;

    public AlertaBoletaDto() {}

    public AlertaBoletaDto(Long boletaId, Double total, String usuarioEmail, String mensaje, String severidad) {
        this.boletaId = boletaId;
        this.total = total;
        this.usuarioEmail = usuarioEmail;
        this.mensaje = mensaje;
        this.severidad = severidad;
    }

    // Getters y Setters
    public Long getBoletaId() { return boletaId; }
    public void setBoletaId(Long boletaId) { this.boletaId = boletaId; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public String getSeveridad() { return severidad; }
    public void setSeveridad(String severidad) { this.severidad = severidad; }
}