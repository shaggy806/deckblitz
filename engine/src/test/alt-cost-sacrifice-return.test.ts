import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, hand, pickModes, pickPermanents, ref, settle, spawn, table, toHand, zone } from "./harness.js";

// Mercadian Masques' free spells: "you may sacrifice a Mountain rather than
// pay this spell's mana cost" (Crash, Thunderclap) and "you may return three
// Islands you control to their owner's hand rather than pay" (Thwart, Tidal
// Bore) — alternative costs (rule 118.9) whose permanents are chosen as the
// cost is paid, once the spell is on the stack (601.2h), offered only while
// the caster controls enough of them.

const altOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.altCost === true);

describe("alternative costs: sacrifice or return permanents rather than pay", () => {
  it("Crash: sacrifices the Mountain chosen, no mana", () => {
    const { game } = table();
    const crash = toHand(game, "Crash");
    const rock = spawn(game, "Mind Stone", B);
    expect(altOffers(game, crash)).toHaveLength(0);
    spawn(game, "Mountain");
    const second = spawn(game, "Mountain");
    spawn(game, "Forest");
    expect(altOffers(game, crash)).toHaveLength(1);
    cast(game, crash, { targets: [ref(rock)], altCost: true, settle: false });
    expect(game.state.awaiting?.kind).toBe("sacrifice");
    const asked = game.legalActions(A).find((x) => x.kind === "sacrifice");
    expect(asked?.kind === "sacrifice" ? asked.eligible.length : 0).toBe(2);
    game.dispatch({ type: "sacrifice", player: A, permanents: [second] });
    settle(game);
    expect(zone(game, second)).toBe("graveyard");
    expect(zone(game, rock)).toBe("graveyard");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].owner === A)).toHaveLength(2);
  });

  it("Thunderclap's sacrifice isn't a Forest", () => {
    const { game } = table();
    const clap = toHand(game, "Thunderclap");
    spawn(game, "Forest");
    expect(altOffers(game, clap)).toHaveLength(0);
  });

  it("Thwart: three Islands back to hand, and the spell is countered", () => {
    const { game, a } = table();
    const thwart = toHand(game, "Thwart");
    const islands = [spawn(game, "Island"), spawn(game, "Island")];
    expect(altOffers(game, thwart)).toHaveLength(0);
    islands.push(spawn(game, "Island"));
    const fourth = spawn(game, "Island");
    spawn(game, "Forest");
    spawn(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(altOffers(game, thwart)).toHaveLength(1);
    const before = hand(game).length;
    const seen = pickPermanents(a, ...islands);
    cast(game, thwart, { targets: [ref(bears)], altCost: true });
    expect(seen.offered).toHaveLength(4);
    for (const id of islands) expect(zone(game, id)).toBe("hand");
    expect(zone(game, fourth)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Tidal Bore: one Island, the only one, returned without asking; then tap", () => {
    const { game, a } = table();
    const bore = toHand(game, "Tidal Bore");
    const island = spawn(game, "Island");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    cast(game, bore, { targets: [ref(bears)], altCost: true });
    expect(zone(game, island)).toBe("hand");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
