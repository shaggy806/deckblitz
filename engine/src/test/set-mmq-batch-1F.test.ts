import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, hand, life, pickPermanents, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

// Batch 227, group F: older cards on the new sacrifice / return-to-hand
// alternative costs (rule 118.9).

const altOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.altCost === true);

describe("MMQ batch 1F: sacrifice and return alternative costs", () => {
  it("Demon of Death's Gate: pays 6 life and sacrifices three black creatures", () => {
    const { game } = table();
    const demon = toHand(game, "Demon of Death's Gate");
    const black = [spawn(game, "Vampire Nighthawk"), spawn(game, "Vampire Nighthawk")];
    spawn(game, "Grizzly Bears");
    expect(altOffers(game, demon)).toHaveLength(0);
    black.push(spawn(game, "Vampire Nighthawk"));
    const extra = spawn(game, "Vampire Nighthawk");
    expect(altOffers(game, demon)).toHaveLength(1);
    cast(game, demon, { altCost: true, settle: false });
    expect(game.state.awaiting?.kind).toBe("sacrifice");
    const asked = game.legalActions(A).find((x) => x.kind === "sacrifice");
    expect(asked?.kind === "sacrifice" ? asked.eligible.length : 0).toBe(4);
    game.dispatch({ type: "sacrifice", player: A, permanents: black });
    settle(game);
    for (const id of black) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, extra)).toBe("battlefield");
    expect(zone(game, demon)).toBe("battlefield");
    expect(life(game)).toBe(14);
  });

  it("Hand of Emrakul: four Eldrazi Spawn, not just any Eldrazi", () => {
    const { game } = table();
    const hand = toHand(game, "Hand of Emrakul");
    const spawnToken = (): ObjectId => {
      const id = spawn(game, "Eldrazi Spawn Token");
      game.state.objects[id].isToken = true;
      return id;
    };
    const spawns = [spawnToken(), spawnToken(), spawnToken()];
    spawn(game, "Eldrazi Ravager");
    expect(altOffers(game, hand)).toHaveLength(0);
    spawns.push(spawnToken());
    expect(altOffers(game, hand)).toHaveLength(1);
    cast(game, hand, { altCost: true });
    expect(zone(game, hand)).toBe("battlefield");
    for (const id of spawns) expect(game.state.zones.shared.battlefield).not.toContain(id);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].owner === A)).toHaveLength(2);
  });

  it("Flare of Cultivation: a token green creature can't pay", () => {
    const { game } = table();
    const flare = toHand(game, "Flare of Cultivation");
    const lizard = spawn(game, "2/2 Green Lizard Token");
    game.state.objects[lizard].isToken = true;
    spawn(game, "Vampire Nighthawk");
    expect(altOffers(game, flare)).toHaveLength(0);
    spawn(game, "Grizzly Bears");
    expect(altOffers(game, flare)).toHaveLength(1);
  });

  it("Dark Triumph: only while you control a Swamp", () => {
    const { game } = table();
    const triumph = toHand(game, "Dark Triumph");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    spawn(game, "Swamp", B);
    expect(altOffers(game, triumph)).toHaveLength(0);
    spawn(game, "Swamp");
    expect(altOffers(game, triumph)).toHaveLength(1);
    cast(game, triumph, { altCost: true, settle: false });
    game.dispatch({ type: "sacrifice", player: A, permanents: [bears] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, other)).toEqual({ power: 4, toughness: 2 });
  });

  it("Mind Swords: each player exiles two cards from their hand", () => {
    const { game } = table();
    const swords = toHand(game, "Mind Swords");
    spawn(game, "Swamp");
    spawn(game, "Swamp");
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    cast(game, swords);
    expect(hand(game, A).length).toBe(mine - 3);
    expect(hand(game, B).length).toBe(theirs - 2);
  });

  it("Downhill Charge: X counts the Mountains left after the sacrifice", () => {
    const { game } = table();
    const charge = toHand(game, "Downhill Charge");
    const bears = spawn(game, "Grizzly Bears");
    const mountains = [spawn(game, "Mountain"), spawn(game, "Mountain"), spawn(game, "Mountain")];
    cast(game, charge, { targets: [ref(bears)], altCost: true, settle: false });
    game.dispatch({ type: "sacrifice", player: A, permanents: [mountains[0]] });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });

  it("Ensnare: two Islands back to hand, every creature tapped", () => {
    const { game, a } = table();
    const ensnare = toHand(game, "Ensnare");
    const islands = [spawn(game, "Island"), spawn(game, "Island"), spawn(game, "Island")];
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, islands[0], islands[1]);
    cast(game, ensnare, { altCost: true });
    expect(zone(game, islands[0])).toBe("hand");
    expect(zone(game, islands[1])).toBe("hand");
    expect(zone(game, islands[2])).toBe("battlefield");
    expect(game.state.objects[mine].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("Flare of Fortitude: your life total can't change this turn", () => {
    const { game } = table();
    const flare = toHand(game, "Flare of Fortitude");
    const cleric = spawn(game, "Savannah Lions");
    cast(game, flare, { altCost: true });
    expect(zone(game, cleric)).toBe("graveyard");
    const bolt = toHand(game, "Lightning Bolt");
    spawn(game, "Mountain");
    cast(game, bolt, { targets: [ref(A)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game)).toBe(20);
  });
});
