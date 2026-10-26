import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Weatherlight batch 1C", () => {
  it("Cinder Giant deals 2 damage to each other creature you control at your upkeep", () => {
    const { game } = table();
    const giant = spawn(game, "Cinder Giant");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("Paradigm Shift exiles the library, then shuffles the graveyard in (not itself)", () => {
    const { game } = table();
    lands(game, "Island", 2);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Shock");
    const shift = toHand(game, "Paradigm Shift");
    cast(game, shift);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.length).toBe(2);
    expect(library.map((id) => game.state.objects[id].cardName).sort()).toEqual(["Grizzly Bears", "Shock"]);
    expect(graveyard(game).map((id) => game.state.objects[id].cardName)).toEqual(["Paradigm Shift"]);
  });

  it("Orcish Settlers destroys X target lands for {X}{X}{R}", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const settlers = spawn(game, "Orcish Settlers");
    const [l1, l2] = lands(game, "Forest", 2, B);
    activate(game, settlers, 0, { x: 2, targets: [ref(l1), ref(l2)] });
    expect(zone(game, l1)).toBe("graveyard");
    expect(zone(game, l2)).toBe("graveyard");
    expect(zone(game, settlers)).toBe("graveyard");
  });

  it("Serenity destroys every artifact and enchantment at your upkeep, itself included", () => {
    const { game } = table();
    const serenity = spawn(game, "Serenity");
    const ring = spawn(game, "Sol Ring", B);
    toStep(game, "draw");
    expect(zone(game, serenity)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("Apathy: discarding at random untaps the creature; an empty hand untaps nothing", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Apathy"), { targets: [ref(bears)] });
    game.state.objects[bears].tapped = true;
    pickModes(a, 0);
    const graveBefore = graveyard(game).length;
    toStep(game, "draw");
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(graveyard(game).length).toBe(graveBefore + 1);

    // Tap it again, empty the hand, and say yes anyway: nothing to discard, no untap.
    game.state.objects[bears].tapped = true;
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    const graveAfter = graveyard(game).length;
    toStep(game, "draw");
    expect(graveyard(game).length).toBe(graveAfter);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Inner Sanctum prevents all damage to creatures you control, not to you", () => {
    const { game } = table();
    spawn(game, "Inner Sanctum");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game)).toBe(18);
  });

  it("Maraxus of Keld counts untapped artifacts, creatures and lands, each once", () => {
    const { game } = table();
    const maraxus = spawn(game, "Maraxus of Keld");
    spawn(game, "Ornithopter"); // artifact creature: one
    lands(game, "Mountain", 2);
    spawn(game, "Mountain", A, { tapped: true });
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, maraxus)).toEqual({ power: 4, toughness: 4 });
  });

  it("Phantom Wings grants flying, and sacrificing it returns the creature", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const wings = toHand(game, "Phantom Wings");
    cast(game, wings, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    activate(game, wings);
    expect(zone(game, wings)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
  });

  it("Shattered Crypt returns X creature cards and costs X life", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const c1 = toGraveyard(game, "Grizzly Bears");
    const c2 = toGraveyard(game, "Ornithopter");
    cast(game, toHand(game, "Shattered Crypt"), { x: 2, targets: [ref(c1), ref(c2)] });
    expect(zone(game, c1)).toBe("hand");
    expect(zone(game, c2)).toBe("hand");
    expect(life(game)).toBe(18);
  });

  it("Rogue Elephant is sacrificed unless you sacrifice a Forest", () => {
    const { game, a } = table();
    const lone = enter(game, "Rogue Elephant");
    expect(zone(game, lone)).toBe("graveyard");

    const forest = spawn(game, "Forest");
    pickModes(a, 0);
    pickPermanents(a, forest);
    const kept = enter(game, "Rogue Elephant");
    settle(game);
    expect(zone(game, kept)).toBe("battlefield");
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("Chimeric Sphere: the 2/1 flier then the 3/2 is a 3/2 without flying, and the reverse a 2/1 flier", () => {
    const { game } = table();
    lands(game, "Wastes", 8);
    const sphere = spawn(game, "Chimeric Sphere");
    activate(game, sphere, 0);
    expect(pt(game, sphere)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, sphere).has("flying")).toBe(true);
    activate(game, sphere, 1);
    expect(pt(game, sphere)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, sphere).has("flying")).toBe(false);
    activate(game, sphere, 0);
    expect(pt(game, sphere)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, sphere).has("flying")).toBe(true);
  });
});
