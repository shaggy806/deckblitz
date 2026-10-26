import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  life,
  lands,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

// Haunt (rule 702.55): "When this creature dies, exile it haunting target
// creature" — or, on an instant or sorcery, "when this spell card is put into
// a graveyard after resolving". The card in exile haunts that creature
// (702.55b), and its "when the creature it haunts dies" ability triggers from
// exile (702.55c).

describe("haunt on a creature", () => {
  it("Blind Hunter drains on entering, haunts a creature as it dies, and drains again when that one dies", () => {
    const { game, a } = table();
    a.chooseTargetsFn = (_v, _s, specs) => specs.map(() => ref(B));
    const hunter = enter(game, "Blind Hunter");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);

    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bear)];
    destroy(game, hunter);
    expect(zone(game, hunter)).toBe("exile");
    expect(game.state.objects[hunter].haunting?.object).toBe(bear);

    a.chooseTargetsFn = () => [ref(B)];
    destroy(game, bear);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });

  it("with no creature to haunt, it stays in the graveyard", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => [ref(B)];
    const hunter = enter(game, "Blind Hunter");
    destroy(game, hunter);
    expect(zone(game, hunter)).toBe("graveyard");
  });

  it("only the haunted creature's death triggers it — not another's, and not the haunted one back as a new object", () => {
    const { game, a } = table();
    a.chooseTargetsFn = () => [ref(B)];
    const hunter = enter(game, "Blind Hunter");
    const bear = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bear)];
    destroy(game, hunter);
    a.chooseTargetsFn = () => [ref(B)];
    destroy(game, other);
    expect(life(game, B)).toBe(18);
    // Bounced and replayed, it's a new object (rule 400.7).
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(bear)]);
    settle(game);
    game.debugMove(bear, "battlefield");
    destroy(game, bear);
    expect(life(game, B)).toBe(18);
  });

  it("Orzhov Pontiff's mode is chosen again from exile", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const pontiff = enter(game, "Orzhov Pontiff");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(theirs)];
    destroy(game, pontiff);
    pickModes(a, 1);
    const goblin = spawn(game, "Raging Goblin", B);
    destroy(game, theirs);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
  });

  it("Graven Dominator from exile leaves no creature out", () => {
    const { game, a } = table();
    const dominator = enter(game, "Graven Dominator");
    const wurm = spawn(game, "Craw Wurm", B);
    a.chooseTargetsFn = () => [ref(wurm)];
    destroy(game, dominator);
    const mine = spawn(game, "Craw Wurm");
    destroy(game, wurm);
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
  });

  it("Graven Dominator entering leaves itself out", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const dominator = enter(game, "Graven Dominator");
    expect(pt(game, wurm)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, dominator)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("haunt on a spell", () => {
  it("Cry of Contrition haunts a creature after resolving, and makes its target discard when it dies", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    const bear = spawn(game, "Grizzly Bears", B);
    const cry = toHand(game, "Cry of Contrition");
    a.chooseTargetsFn = () => [ref(bear)];
    const before = hand(game, B).length;
    cast(game, cry, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
    expect(zone(game, cry)).toBe("exile");
    a.chooseTargetsFn = () => [ref(B)];
    destroy(game, bear);
    expect(hand(game, B).length).toBe(before - 2);
  });

  it("countered, it doesn't haunt", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    spawn(game, "Grizzly Bears", B);
    const cry = toHand(game, "Cry of Contrition");
    let asked = false;
    a.chooseTargetsFn = (_v, _s, specs, options) => {
      asked = true;
      return specs.map((_spec, i) => options[i]?.[0] ?? null);
    };
    cast(game, cry, { targets: [ref(B)], settle: false });
    asked = false;
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(cry)]);
    settle(game);
    expect(zone(game, cry)).toBe("graveyard");
    expect(asked).toBe(false);
    expect(graveyard(game)).toContain(cry);
  });

  it("Benediction of Moons gains a life per player in the game", () => {
    const { game } = table({ players: 4 });
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Benediction of Moons"));
    expect(life(game, A)).toBe(24);
  });
});
