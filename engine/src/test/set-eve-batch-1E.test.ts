import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Eventide batch 1E", () => {
  it("Thunderblust persists with a -1/-1 counter and then has trample", () => {
    const { game } = table();
    const blust = spawn(game, "Thunderblust");
    expect(keywords(game, blust).has("trample")).toBe(false);
    destroy(game, blust);
    const [back] = named(game, "Thunderblust", A);
    expect(back).toBeDefined();
    expect(zone(game, back)).toBe("battlefield");
    expect(counters(game, back, "-1/-1")).toBe(1);
    expect(pt(game, back)).toEqual({ power: 6, toughness: 1 });
    expect(keywords(game, back).has("trample")).toBe(true);
  });

  it("Fable of Wolf and Owl makes both tokens for a green-blue spell", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Fable of Wolf and Owl");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Growth Spiral"));
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
    expect(tokensNamed(game, "1/1 Blue Bird Token", A)).toBe(1);
  });

  it("Springjack Shepherd counts white symbols among your permanents, its own included", () => {
    const { game } = table();
    spawn(game, "Spirit of the Hearth");
    spawn(game, "Spirit of the Hearth", B);
    enter(game, "Springjack Shepherd");
    expect(tokensNamed(game, "Goat Token", A)).toBe(3);
  });

  it("Tilling Treefolk returns up to two land cards from your graveyard", () => {
    const { game, a } = table();
    const l1 = toGraveyard(game, "Forest");
    const l2 = toGraveyard(game, "Island");
    pickTargets(a, l1, l2);
    pickModes(a, 0);
    enter(game, "Tilling Treefolk");
    expect(zone(game, l1)).toBe("hand");
    expect(zone(game, l2)).toBe("hand");
  });

  it("Doomgape's upkeep sacrifice gains life equal to the sacrificed creature's toughness", () => {
    const { game, a } = table();
    spawn(game, "Doomgape");
    const bears = spawn(game, "Grizzly Bears");
    a.chooseSacrificesFn = (_view, eligible) => (eligible.includes(bears) ? [bears] : [eligible[0]]);
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game)).toBe(22);
  });

  it("Unwilling Recruit steals, untaps and pumps by X", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Unwilling Recruit"), { x: 2, targets: [ref(bears)] });
    expect(game.state.objects[bears].controller).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("Battlegate Mimic becomes 4/2 first strike for a red-and-white spell only", () => {
    const { game } = table();
    const mimic = spawn(game, "Battlegate Mimic");
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, mimic)).toEqual({ power: 2, toughness: 1 });
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    expect(pt(game, mimic)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, mimic).has("first-strike")).toBe(true);
  });

  it("Mirror Sheen targets only an instant or sorcery spell that targets you", () => {
    const { game } = table();
    const sheen = spawn(game, "Mirror Sheen");
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    const atB = toHand(game, "Shock");
    cast(game, atB, { targets: [ref(B)], settle: false });
    const act = (target: string) =>
      game.canDispatch({
        type: "activate-ability",
        player: A,
        source: sheen,
        abilityIndex: 0,
        targets: [ref(target as never)],
      });
    expect(act(atB)).not.toBeNull();
    const atMe = toHand(game, "Shock");
    cast(game, atMe, { targets: [ref(A)], settle: false });
    expect(act(atMe)).toBeNull();
  });

  it("Razorfin Abolisher bounces only a creature with a counter on it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const abolisher = spawn(game, "Razorfin Abolisher");
    const plain = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, abolisher, 0, { targets: [ref(plain)] })).toThrow();
    const marked = spawn(game, "Grizzly Bears", B);
    game.state.objects[marked].counters["-1/-1"] = 1;
    activate(game, abolisher, 0, { targets: [ref(marked)] });
    expect(zone(game, marked)).toBe("hand");
  });

  it("Selkie Hedge-Mage gains 3 with two Forests and doesn't trigger without Islands", () => {
    const { game, a } = table();
    pickModes(a, 0);
    lands(game, "Forest", 2);
    spawn(game, "Grizzly Bears", B, { tapped: true });
    enter(game, "Selkie Hedge-Mage");
    expect(life(game)).toBe(23);
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });

  it("Noggle Hedge-Mage taps two target permanents with two Islands", () => {
    const { game, a } = table();
    pickModes(a, 0);
    lands(game, "Island", 2);
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(x), ref(y)];
    enter(game, "Noggle Hedge-Mage");
    expect(game.state.objects[x].tapped).toBe(true);
    expect(game.state.objects[y].tapped).toBe(true);
    expect(life(game, B)).toBe(20);
  });

  it("Hag Hedge-Mage makes the target player discard with two Swamps", () => {
    const { game, a } = table();
    pickModes(a, 0);
    lands(game, "Swamp", 2);
    a.chooseTargetsFn = () => [ref(B)];
    const before = hand(game, B).length;
    enter(game, "Hag Hedge-Mage");
    expect(hand(game, B).length).toBe(before - 1);
  });

  it("Swirling Spriggan makes a creature you control the chosen colours until end of turn", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const spriggan = spawn(game, "Swirling Spriggan");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    activate(game, spriggan, 0, { targets: [ref(bears)] });
    expect([...computeCharacteristics(game.state, registryOf(game), bears).colors]).toEqual(["W"]);
  });

  it("Idle Thoughts draws nothing while you have cards in hand", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const thoughts = spawn(game, "Idle Thoughts");
    const before = hand(game).length;
    activate(game, thoughts);
    expect(hand(game).length).toBe(before);
  });

  it("Hotheaded Giant enters with two -1/-1 counters unless you've cast another red spell", () => {
    const { game } = table();
    lands(game, "Mountain", 9);
    const first = toHand(game, "Hotheaded Giant");
    cast(game, first);
    expect(counters(game, first, "-1/-1")).toBe(2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const second = toHand(game, "Hotheaded Giant");
    cast(game, second);
    expect(counters(game, second, "-1/-1")).toBe(0);
  });

  it("Hotheaded Giant put onto the battlefield counts any red spell you cast this turn", () => {
    const { game } = table();
    const early = enter(game, "Hotheaded Giant");
    expect(counters(game, early, "-1/-1")).toBe(2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    const late = enter(game, "Hotheaded Giant");
    expect(counters(game, late, "-1/-1")).toBe(0);
  });
});
