import { describe, expect, it } from "vitest";
import { colorIdentityOf, identityString } from "../identity.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("playtest batch 341 D", () => {
  it("Devoted Mardu is white alone: the {R}, {W} and {B} sit in a reminder holding a reminder (rule 903.4c)", () => {
    const { game } = table();
    const def = registryOf(game).get("Devoted Mardu");
    expect(identityString(colorIdentityOf(def, registryOf(game)))).toBe("W");
  });

  it("Jitte and Divining Top: tapping it draws and tops it; already tapped, nothing", () => {
    const { game } = table();
    const jitte = spawn(game, "Jitte and Divining Top");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 2 }, [ref(jitte)]);
    const before = hand(game).length;
    activate(game, jitte, 0, { modes: [2] });
    expect(hand(game).length).toBe(before + 1);
    expect(zone(game, jitte)).toBe("library");

    const tapped = spawn(game, "Jitte and Divining Top", A, { tapped: true });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 1 }, [ref(tapped)]);
    const before2 = hand(game).length;
    activate(game, tapped, 0, { modes: [2] });
    expect(hand(game).length).toBe(before2);
    expect(zone(game, tapped)).toBe("battlefield");
    expect(counters(game, tapped, "charge")).toBe(0);
  });

  it("The Keeper of Four Scythes: four Scythes; an equipped creature gets both bonuses", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    enter(game, "The Keeper of Four Scythes");
    expect(tokensNamed(game, "Scythe Token", A)).toBe(4);
    const bear = spawn(game, "Grizzly Bears");
    const scythe = game.battlefield.find((id) => game.state.objects[id].cardName === "Scythe Token")!;
    activate(game, scythe, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
  });

  it("Devoted Mardu: mobilize counts red, white and black symbols, a hybrid once", () => {
    const { game, a } = table();
    const mardu = spawn(game, "Devoted Mardu");
    spawn(game, "Phyrexian Arena"); // {1}{B}{B}: 2
    spawn(game, "Boros Reckoner"); // {R/W}{R/W}{R/W}: 3
    attack(game, a, [mardu]);
    expect(tokensNamed(game, "Red Warrior Token", A)).toBe(6);
  });

  it("The Value Knight: Syr Acha's draw replacement doubles draws for the turn; each draw grows the Knight", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const knight = enter(game, "The Value Knight");
    expect(tokensNamed(game, "Syr Acha", A)).toBe(1);
    const acha = spawn(game, "Syr Acha");
    activate(game, acha, 0);
    expect(life(game)).toBe(23);
    lands(game, "Island", 3);
    const divination = toHand(game, "Divination");
    const before = hand(game).length;
    cast(game, divination);
    expect(hand(game).length).toBe(before - 1 + 4);
    expect(counters(game, knight)).toBe(4);
  });

  it("Primetime Suspect: two lands while enchanted creature is suspected, one otherwise", () => {
    for (const suspected of [true, false]) {
      const { game, a } = table();
      const bear = spawn(game, "Grizzly Bears");
      lands(game, "Forest", 2);
      const aura = toHand(game, "Primetime Suspect");
      cast(game, aura, { targets: [ref(bear)] });
      if (suspected) {
        game.debugApplyEffect(A, { kind: "suspect", target: 0 }, [ref(bear)]);
        settle(game);
      }
      const library = game.state.zones.perPlayer[A].library;
      pickModes(a, 0);
      if (suspected) pickFromZone(a, library[0], library[1]);
      else pickFromZone(a, library[0]);
      const wastesBefore = game.battlefield.filter((id) => game.state.objects[id].cardName === "Wastes").length;
      attack(game, a, [bear]);
      const wastes = game.battlefield.filter((id) => game.state.objects[id].cardName === "Wastes");
      expect(wastes.length - wastesBefore).toBe(suspected ? 2 : 1);
    }
  });

  it("Delve too Deep: delve pays X; X of 7 makes the Demon, 6 doesn't", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    const yard = Array.from({ length: 7 }, () => toGraveyard(game, "Wastes"));
    const spell = toHand(game, "Delve too Deep");
    cast(game, spell, { targets: [ref(bear)], x: 7, delve: yard });
    expect(zone(game, bear)).toBe("graveyard");
    expect(tokensNamed(game, "7/7 Black Red Demon Token", A)).toBe(1);

    const t2 = table();
    const bear2 = spawn(t2.game, "Grizzly Bears", B);
    lands(t2.game, "Swamp", 7);
    cast(t2.game, toHand(t2.game, "Delve too Deep"), { targets: [ref(bear2)], x: 6 });
    expect(zone(t2.game, bear2)).toBe("graveyard");
    expect(tokensNamed(t2.game, "7/7 Black Red Demon Token", A)).toBe(0);
  });

  it("Phyrexian Broodstar: */* is the Phyrexians you control, itself included", () => {
    const { game } = table();
    const star = spawn(game, "Phyrexian Broodstar");
    spawn(game, "Phyrexian Rager");
    spawn(game, "Phyrexian Rager", B);
    expect(pt(game, star)).toEqual({ power: 2, toughness: 2 });
  });

  it("Wrath of Leknif and Simic Slaw: one counter for creatures dying together; lands untapped; Slaw draws and gains X", () => {
    const { game, a } = table();
    const slaw = spawn(game, "Simic Slaw");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears", B)];
    const mana = [...lands(game, "Plains", 3), ...lands(game, "Island", 1)];
    pickPermanents(a, ...mana);
    cast(game, toHand(game, "Wrath of Leknif"));
    for (const bear of bears) expect(zone(game, bear)).toBe("graveyard");
    for (const land of mana) expect(game.state.objects[land].tapped).toBe(false);
    expect(counters(game, slaw, "charge")).toBe(1);
    const before = hand(game).length;
    activate(game, slaw, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(21);
    expect(graveyard(game)).toContain(slaw);
  });

  it("Search Elemental: a search scries, the scry grows it and makes it unblockable", () => {
    const { game, a } = table();
    const elemental = spawn(game, "Search Elemental");
    pickFromZone(a);
    game.debugApplyEffect(A, { kind: "search-library", filter: { type: "land" }, destination: "hand", min: 0, max: 1 }, []);
    settle(game);
    expect(counters(game, elemental)).toBe(1);
    expect(keywords(game, elemental).has("unblockable")).toBe(true);
  });

  it("Jeska and Kamahl: 2 damage to an opponent; not to yourself", () => {
    const { game } = table();
    const jk = spawn(game, "Jeska and Kamahl");
    expect(() => activate(game, jk, 0, { targets: [ref(A)] })).toThrow(/target/i);
    activate(game, jk, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });

  it("Magus of the Chains: a draw outside the draw step discards then draws, an empty hand mills", () => {
    const { game, b } = table();
    spawn(game, "Magus of the Chains");
    const before = hand(game, B).length;
    const yardBefore = graveyard(game, B).length;
    b.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(hand(game, B).length).toBe(before);
    expect(graveyard(game, B).length).toBe(yardBefore + 1);

    for (const id of [...hand(game, B)]) game.debugMove(id, "exile");
    const library = game.state.zones.perPlayer[B].library.length;
    game.debugApplyEffect(B, { kind: "draw", amount: 1 }, []);
    settle(game);
    expect(hand(game, B).length).toBe(0);
    expect(game.state.zones.perPlayer[B].library.length).toBe(library - 1);
    expect(graveyard(game, B).length).toBe(yardBefore + 2);
  });

  it("Luxior, Ignited:+1 attaches it; the creature gets +1/+1 per counter on Luxior", () => {
    const { game } = table();
    const lux = spawn(game, "Luxior, Ignited");
    expect(counters(game, lux, "loyalty")).toBe(1);
    const bear = spawn(game, "Grizzly Bears");
    loyalty(game, lux, 1, { targets: [ref(bear)] });
    expect(game.state.objects[lux].attachedTo).toBe(bear);
    expect(counters(game, lux, "loyalty")).toBe(2);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
  });
});
