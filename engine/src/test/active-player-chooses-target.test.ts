/**
 * Choices made by a player other than the controller that the effect then
 * uses: the active player choosing the target of someone else's trigger, as
 * it goes on the stack (rules 603.3d, 700.2e — Magus of the Abyss, the Oaths),
 * and a targeted player choosing cards from their own hand.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  cast,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

describe("Magus of the Abyss", () => {
  it("the player whose upkeep it is chooses among their own nonartifact creatures", () => {
    const { game, b } = table({ step: "end" });
    spawn(game, "Magus of the Abyss", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const golem = spawn(game, "Darksteel Colossus", B);
    const seen = watchTargets(b, () => [bears]);
    toStep(game, "draw", B);
    settle(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(golem);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("hexproof is read against its controller, not the chooser", () => {
    const { game, b } = table({ step: "end" });
    spawn(game, "Magus of the Abyss", A);
    const hexed = spawn(game, "Gladecover Scout", B);
    const open = spawn(game, "Hill Giant", B);
    const seen = watchTargets(b, () => [open]);
    toStep(game, "draw", B);
    settle(game);
    // Alice's ability: an opponent of Alice's creature with hexproof can't be
    // chosen, though Bob controls it and chooses (the ruling). One left, so
    // nobody is asked at all.
    expect(seen.asked).toBe(0);
    expect(zone(game, hexed)).toBe("battlefield");
    expect(zone(game, open)).toBe("graveyard");
  });

  it("is removed with nothing to choose, and is its controller's own trouble too", () => {
    const { game } = table({ step: "end", players: 3 });
    const magus = spawn(game, "Magus of the Abyss", C);
    toStep(game, "draw", B);
    settle(game);
    expect(zone(game, magus)).toBe("battlefield");
    toStep(game, "draw", C);
    settle(game);
    expect(zone(game, magus)).toBe("graveyard");
    expect(graveyard(game, C)).toContain(magus);
  });
});

describe("the Oaths", () => {
  it("Oath of Druids: the active player targets an opponent with more creatures and reveals their own library", () => {
    const { game, b } = table({ step: "end", deck: "Wastes" });
    spawn(game, "Oath of Druids", A);
    spawn(game, "Grizzly Bears", A);
    const elf = toLibrary(game, "Llanowar Elves", B);
    const forest = toLibrary(game, "Forest", B);
    const top = game.state.zones.perPlayer[B].library.filter((id) => id !== elf && id !== forest);
    game.state.zones.perPlayer[B].library = [forest, elf, ...top];
    b.chooseModesFn = () => [0];
    toStep(game, "draw", B);
    settle(game);
    expect(zone(game, elf)).toBe("battlefield");
    expect(game.state.objects[elf].controller).toBe(B);
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("doesn't trigger a target on the player with as many or more: nobody to target, it's removed", () => {
    const { game, b } = table({ step: "end", deck: "Wastes" });
    spawn(game, "Oath of Druids", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    const elf = toLibrary(game, "Llanowar Elves", B);
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "draw", B);
    settle(game);
    expect(asked).toBe(0);
    expect(zone(game, elf)).not.toBe("battlefield");
  });

  it("targets only opponents of the active player, and the Oath's controller may be one", () => {
    const { game, c } = table({ step: "end", players: 3, deck: "Wastes" });
    spawn(game, "Oath of Mages", A);
    game.state.players[A].life = 30;
    game.state.players[B].life = 25;
    game.state.players[C].life = 20;
    const seen = watchTargets(c, () => [B]);
    c.chooseModesFn = () => [0];
    toStep(game, "draw", C);
    settle(game);
    expect(seen.offered[0]).toContain(A);
    expect(seen.offered[0]).toContain(B);
    expect(seen.offered[0]).not.toContain(C);
    expect(life(game, B)).toBe(24);
    expect(life(game, A)).toBe(30);
    expect(life(game, C)).toBe(20);
  });

  it("the comparison is read again as it resolves: no longer true, no effect (rule 608.2b)", () => {
    const { game, b } = table({ step: "end", deck: "Wastes" });
    spawn(game, "Oath of Mages", A);
    game.state.players[A].life = 21;
    game.state.players[B].life = 20;
    b.chooseModesFn = () => [0];
    toStep(game, "upkeep", B);
    expect(game.state.turn.step).toBe("upkeep");
    game.state.players[A].life = 19;
    settle(game);
    expect(life(game, A)).toBe(19);
  });

  it("the may is the first player's alone: declining does nothing", () => {
    const { game, b } = table({ step: "end", deck: "Wastes" });
    spawn(game, "Oath of Mages", A);
    game.state.players[A].life = 30;
    game.state.players[B].life = 20;
    b.chooseModesFn = () => [];
    toStep(game, "draw", B);
    settle(game);
    expect(life(game, A)).toBe(30);
  });

  it("Oath of Lieges: a basic land onto the battlefield under the first player's control", () => {
    const { game, b } = table({ step: "end", deck: "Wastes" });
    spawn(game, "Oath of Lieges", A);
    lands(game, "Wastes", 1, A);
    const forest = toLibrary(game, "Forest", B);
    b.chooseModesFn = () => [0];
    pickFromZone(b, forest);
    toStep(game, "draw", B);
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].controller).toBe(B);
    expect(game.state.objects[forest].tapped).toBe(false);
  });

  it("Oath of Ghouls: only a player with more creature cards in their graveyard than their opponent's can use it", () => {
    const { game, a, b } = table({ step: "end", deck: "Wastes" });
    spawn(game, "Oath of Ghouls", B);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    a.chooseModesFn = () => [0];
    pickFromZone(a, mine);
    toStep(game, "draw", A);
    settle(game);
    // Bob's graveyard has fewer than Alice's: she may return one, though the
    // Oath is his.
    expect(zone(game, mine)).toBe("hand");
    void b;
  });

  it("Oath of Scholars: the first player discards their hand and draws three", () => {
    const { game, b } = table({ step: "end", deck: "Wastes" });
    spawn(game, "Oath of Scholars", A);
    toHand(game, "Forest", A);
    toHand(game, "Forest", A);
    const kept = hand(game, B).slice();
    for (const id of kept) game.debugMove(id, "library");
    b.chooseModesFn = () => [0];
    const forest = toHand(game, "Forest", B);
    toHand(game, "Forest", A);
    toHand(game, "Forest", A);
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, forest)).toBe("graveyard");
    expect(hand(game, B).length).toBe(3);
  });
});

describe("a targeted player's own choice from hand", () => {
  it("Stunted Growth: the target chooses three and the rest stay", () => {
    const { game, b } = table();
    lands(game, "Forest", 5);
    const [one, two, three, four] = [
      toHand(game, "Forest", B),
      toHand(game, "Grizzly Bears", B),
      toHand(game, "Hill Giant", B),
      toHand(game, "Llanowar Elves", B),
    ];
    pickFromZone(b, one, two, three);
    cast(game, toHand(game, "Stunted Growth"), { targets: [ref(B)] });
    for (const id of [one, two, three]) expect(zone(game, id)).toBe("library");
    expect(zone(game, four)).toBe("hand");
    const library = game.state.zones.perPlayer[B].library;
    expect(new Set(library.slice(0, 3))).toEqual(new Set([one, two, three]));
  });

  it("Stunted Growth with two in hand takes both", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    for (const id of [...hand(game, B)]) game.debugMove(id, "library");
    const pair = [toHand(game, "Forest", B), toHand(game, "Grizzly Bears", B)];
    cast(game, toHand(game, "Stunted Growth"), { targets: [ref(B)] });
    for (const id of pair) expect(zone(game, id)).toBe("library");
  });

  it("Prying Questions: 3 life and a card of their choice, and just the life with an empty hand", () => {
    const { game, b } = table();
    lands(game, "Swamp", 6);
    for (const id of [...hand(game, B)]) game.debugMove(id, "library");
    const kept = toHand(game, "Forest", B);
    const put = toHand(game, "Grizzly Bears", B);
    pickFromZone(b, put);
    cast(game, toHand(game, "Prying Questions"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, put)).toBe("library");
    expect(game.state.zones.perPlayer[B].library[0]).toBe(put);
    expect(zone(game, kept)).toBe("hand");
    game.debugMove(kept, "library");
    cast(game, toHand(game, "Prying Questions"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });
});
